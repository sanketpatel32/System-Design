# Design Order Management System

> **Category:** E-Commerce and Payments

---

An Order Management System (OMS) coordinates the end-to-end lifecycle of an order from initial placement, inventory allocation, payment capture, fulfillment routing, to delivery tracking and returns handling.

### System Requirements
- **Functional Requirements**:
  - Accept and validate new orders with idempotency checks.
  - Coordinate order processing across payment, inventory, and logistics services.
  - Provide real-time order status tracking for customers.
  - Support order modifications, cancellations, and return workflows.
- **Non-Functional Requirements**:
  - High Durability: Zero order loss guarantee across all state transitions.
  - Idempotency: Prevent duplicate order placement from double-clicks or retries.
  - High Auditability: Complete historical log of all order status changes.

### System Architecture (Saga Orchestration)
```
[ Client ] ---> [ Order API ] ---> [ OMS Orchestrator Engine ]
                                          |
        +-------------------+-------------+-------------+-------------------+
        |                   |                           |                   |
        v                   v                           v                   v
[ Payment Service ]  [ Inventory Service ]    [ Warehouse Router ]  [ Event Stream (Kafka) ]
  (Capture/Refund)   (Allocate/Release)        (Fulfillment SLA)      (Notification/Analytics)
```

### Order State Machine
| Current State | Target State | Triggering Event | Rollback / Compensation Action |
|---|---|---|---|
| `CREATED` | `PAYMENT_PENDING` | Order submitted | Cancel order |
| `PAYMENT_PENDING` | `PAID` | Payment gateway success webhook | Release reserved inventory |
| `PAID` | `FULFILLMENT` | Inventory allocated & warehouse assigned | Initiate refund via Payment Gateway |
| `FULFILLMENT` | `SHIPPED` | Courier pickup scan | N/A (Initiate return workflow) |
| `SHIPPED` | `DELIVERED` | End-customer delivery signature | N/A |

### Database Schema (Orders & Items)
| Table | Key Fields | Sharding / Partition Strategy |
|---|---|---|
| **orders** | `order_id (PK)`, `user_id`, `status`, `total_amount`, `idempotency_key`, `created_at` | Partitioned by `user_id` (Hash sharding) |
| **order_items** | `item_id (PK)`, `order_id (FK)`, `product_id`, `quantity`, `unit_price` | Co-located with `orders` via `user_id` key |
| **order_events** | `event_id (PK)`, `order_id`, `from_state`, `to_state`, `payload`, `timestamp` | Append-only log partitioned by `order_id` |

### API Specification
| Endpoint | Method | Description | Key Headers / Body |
|---|---|---|---|
| `/v1/orders` | POST | Submit a new order | `Idempotency-Key`, `cart_id`, `shipping_address_id` |
| `/v1/orders/{id}` | GET | Retrieve order details & state | `order_id` |
| `/v1/orders/{id}/cancel` | POST | Cancel pending order | `order_id`, `reason` |

### Key takeaway
An Order Management System relies on Saga orchestration to maintain consistency across distributed microservices. Persistent event logs and strict idempotency keys prevent duplicate charges or lost orders during system failures.
