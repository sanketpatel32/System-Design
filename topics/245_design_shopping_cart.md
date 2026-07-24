# Design Shopping Cart

> **Category:** E-Commerce and Payments

---

A Shopping Cart service manages transient product selections made by users prior to checkout. It supports both anonymous guest sessions and authenticated user accounts, ensuring fast item additions, real-time price validation, and multi-device synchronisation.

### System Requirements
- **Functional Requirements**:
  - Add, update, and remove items from guest or user carts.
  - Merge guest cart items into user cart upon login.
  - Recalculate cart totals, discounts, and taxes dynamically.
  - Persist carts across device sessions with automatic expiration for inactive carts.
- **Non-Functional Requirements**:
  - Ultra-Low Latency: Sub-10ms response time for item modification.
  - High Availability: Uninterrupted cart access even during partial storage node failures.
  - Eventual Consistency: Graceful resolution of concurrent modifications across devices.

### System Architecture
```
[ Web / Mobile Clients ] ---> [ Cart Service API ]
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    [ In-Memory Redis Cluster ]                 [ Persistent Storage ]
    (Primary Active Carts)                      (Cassandra / DynamoDB)
               |                                           |
               +---------------------+---------------------+
                                     |
                                     v
                        [ Price & Discount Validator ]
```

### Storage Strategy Comparison
| Storage Option | Read/Write Latency | Persistence Guarantee | Concurrency / Merge Handling |
|---|---|---|---|
| **Redis Hash Key** | $< 2\text{ ms}$ | Volatile / RDB snapshotting | Atomic hash updates; ideal for active session carts. |
| **NoSQL (DynamoDB / Cassandra)** | $5-10\text{ ms}$ | High durability across AZs | Document-level updates; good for long-term saved carts. |
| **Browser LocalStorage** | Immediate | Local to device | Offline capability; requires server synchronization on checkout. |

### API Design
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/cart` | GET | Retrieve cart state & calculated totals | Header: `Authorization` or `X-Guest-Session-ID` |
| `/v1/cart/items` | POST | Add or update item quantity | `product_id`, `quantity`, `variant_id` |
| `/v1/cart/merge` | POST | Merge guest cart into account cart on login | `guest_session_id`, `user_id` |

### Key takeaway
Shopping carts prioritize low-latency read/write operations using Redis key-value clusters, backed by document databases for long-term durability. Seamless cart merging upon authentication and robust price re-validation at checkout prevent stale pricing exploits.
