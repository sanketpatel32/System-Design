# Design Flipkart

> **Category:** E-Commerce and Payments

---

Flipkart is a major e-commerce platform tailored for emerging markets. While structurally similar to Amazon, Flipkart's architecture is optimized for extreme flash sales (e.g., Big Billion Days), localized payment ecosystems (UPI, Cash-on-Delivery), regional fulfillment logistics, and mobile-first low-bandwidth clients.

### System Requirements
- **Functional Requirements**:
  - High-concurrency flash sale participation with instant inventory locking.
  - Multi-modal payment gateway integration supporting UPI, COD (with fraud risk scoring), credit/debit cards, and Buy-Now-Pay-Later (BNPL).
  - Regional warehouse inventory localization and pin-code-based product serviceability.
- **Non-Functional Requirements**:
  - Ultra-High Concurrency: Handle 1,000,000+ checkout requests/sec during flash sales.
  - Fault Tolerance: Graceful degradation during network outages or payment gateway drops.
  - Low Mobile Data Footprint: Lightweight payload responses optimized for 3G/4G networks.

### Flash Sale & Order Architecture
```
[ Mobile Apps ] ---> [ Virtual Waiting Room / Rate Limiter ]
                                   |
                                   v
                            [ API Gateway ]
                                   |
                                   v
                       [ Flash Sale Order Engine ]
                                   |
              +--------------------+--------------------+
              |                                         |
              v                                         v
   [ Redis In-Memory Stock Decr ]             [ Kafka Order Stream ]
   (Lua Script Atomic Allocation)             (Asynchronous Processing)
                                                        |
                                                        v
                                              [ Order Persistence DB ]
```

### Regional & India-Specific Architecture Mitigations
| Mechanism / Component | Technical Implementation | Purpose |
|---|---|---|
| **Virtual Waiting Room** | Edge Queue / Token Bucket at Cloudflare/CDN | Protect backend microservices from crashing under 100x traffic spikes during flash sales. |
| **Pre-Allocated Redis Stock** | Redis Lua Script (`DECRBY` with check `>= 0`) | Sub-millisecond inventory deduction without hitting relational database locks. |
| **COD Fraud Engine** | Real-time ML Risk Scoring (User return history, pin-code risk) | Restrict Cash-on-Delivery for high-risk accounts or high-value electronics. |
| **UPI Auto-Retry Router** | Multi-PSP Switch with fallback circuit breakers | Dynamically route UPI transactions across banks based on live PSP success rates. |

### Core API Specification
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/flash-sale/enter` | POST | Obtain queue token for flash sale item | `user_id`, `sale_item_id` |
| `/v1/orders/place` | POST | Submit order with chosen payment mode | `queue_token`, `payment_mode: "UPI|COD|CARD"`, `address_id` |
| `/v1/pincode/serviceability` | GET | Check item delivery SLA for location | `pincode`, `product_id` |

### Key takeaway
Flipkart's architecture builds upon standard e-commerce patterns by adding specialized high-concurrency flash sale protection (Virtual Waiting Rooms, in-memory Lua stock deduction), multi-bank UPI routing, and risk-based Cash-on-Delivery verification.
