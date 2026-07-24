# Design Inventory Management System

> **Category:** E-Commerce and Payments

---

An Inventory Management System tracks stock counts across multiple physical warehouses, manages reservations during checkout, and guarantees that items are neither oversold nor lost due to double allocations under heavy concurrency.

### System Requirements
- **Functional Requirements**:
  - Track real-time stock levels (available, reserved, allocated, damaged).
  - Perform atomic inventory reservations during checkout with TTL timeouts.
  - Process bulk stock intake and adjustments from warehouses.
- **Non-Functional Requirements**:
  - Strict Consistency: Zero tolerance for overselling limited inventory.
  - High Concurrency: Support thousands of simultaneous stock reservations per product.
  - Fault Tolerance: Auto-release expired reservations if payment fails or times out.

### System Architecture
```
[ Checkout Service ] ---> [ Inventory Service ]
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
  [ Redis Distributed Lock ]            [ DB Inventory Ledger ]
  (Atomic Reservation & TTL)           (RDBMS Transaction Shards)
             |                                     |
             +------------------+------------------+
                                |
                                v
                   [ Expiration Worker (DLQ/TTL) ]
```

### Reservation Concurrency Strategies
| Technique | Implementation | Pros | Cons |
|---|---|---|---|
| **Pessimistic DB Lock** | `SELECT ... FOR UPDATE` | Guaranteed consistency | Poor scalability; locks DB rows and causes timeouts under heavy load. |
| **Optimistic Lock** | `UPDATE stock SET count = count - 1 WHERE id = ? AND count >= 1` | High throughput | Fails frequently under extreme contention (high retry rate). |
| **Redis Atomic Lua Script** | Atomic Lua check and `DECRBY` with reservation key TTL | Sub-millisecond latency; highly scalable | Requires fallback sync mechanism to relational database. |

### Stock Lifecycle & State Machine
| State | Description | Transition Trigger |
|---|---|---|
| **AVAILABLE** | Stock is physically in warehouse and purchasable | Initial stock intake / Unreserved fallback |
| **RESERVED** | Stock held temporarily for user during checkout (15 min TTL) | User clicks "Proceed to Payment" |
| **ALLOCATED** | Stock permanently assigned to paid order | Payment success confirmation webhook |
| **SHIPPED** | Stock physically leaves warehouse | Warehouse dispatch scanning |

### Key API Endpoints
| Endpoint | Method | Description | Request Parameters |
|---|---|---|---|
| `/v1/inventory/reserve` | POST | Attempt atomic stock reservation | `order_id`, `product_id`, `quantity`, `ttl_seconds` |
| `/v1/inventory/release` | POST | Cancel reservation and restore stock | `reservation_id`, `reason` |
| `/v1/inventory/commit` | POST | Finalize stock allocation after payment | `reservation_id`, `order_id` |

### Key takeaway
Inventory management requires strict isolation between available and reserved stock. Utilizing Redis Lua scripts for fast atomic reservations alongside relational database ledgers ensures sub-millisecond checkout performance without risk of overselling.
