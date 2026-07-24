# Design Amazon

> **Category:** E-Commerce and Payments

---

Amazon is a global e-commerce platform handling catalog browsing, search, shopping carts, order orchestration, payment processing, inventory tracking, and fulfillment logistics at massive global scale.

### System Requirements
- **Functional Requirements**:
  - Multi-tier product catalog browsing, filtering, and rich text search.
  - High-availability persistent shopping cart.
  - Distributed checkout pipeline with inventory locking and multi-channel payment charging.
  - Order tracking and fulfillment workflow.
- **Non-Functional Requirements**:
  - High Availability: 99.999% uptime for catalog browsing and cart operations.
  - Scalability: Support millions of QPS during peak shopping events (e.g., Prime Day).
  - Low Latency: Sub-100ms response time for product catalog rendering.

### System Architecture
```
                                 [ Client Web / Mobile ]
                                            |
                                            v
                                     [ API Gateway ]
                                            |
      +-----------------+-------------------+------------------+-------------------+
      |                 |                   |                  |                   |
      v                 v                   v                  v                   v
[ Catalog Service ] [ Search Engine ] [ Cart Service ] [ Order Orchestrator ] [ Payment Service ]
  (DynamoDB/CDN)   (Elasticsearch)    (Redis Cluster)    (Saga Engine)         (PSP Gateway)
```

### Microservice Ecosystem & Data Stores
| Service | Primary Storage | Caching Strategy | Key Responsibilities |
|---|---|---|---|
| **Catalog Service** | DynamoDB / DocumentDB | Multi-tier CDN + Redis | Serve product metadata, specifications, and media links. |
| **Search Service** | Elasticsearch / OpenSearch | In-memory search cache | Full-text query parsing, faceted filtering, and re-ranking. |
| **Cart Service** | Redis Cluster + DynamoDB | In-memory key-value store | Low-latency cart updates and session persistence. |
| **Order Orchestrator** | PostgreSQL / Aurora | Read replicas | Coordinate checkout transaction via Saga choreography. |
| **Inventory Service** | Redis + MySQL Shards | Write-through cache | Track real-time stock levels and soft/hard reservations. |

### API Design
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/products/search` | GET | Search catalog with filters | `query`, `category`, `price_range`, `page` |
| `/v1/cart/items` | POST | Add item to shopping cart | `user_id`, `product_id`, `quantity` |
| `/v1/checkout` | POST | Trigger checkout pipeline | `cart_id`, `payment_method_id`, `shipping_address_id` |

### Checkout Saga Pattern
```
[ Order Service ] ---> 1. Create Pending Order
      |
      +---> 2. Reserve Inventory (Inventory Service)
      |
      +---> 3. Charge Payment (Payment Service)
      |
      +---> 4. Mark Order Confirmed & Dispatch to Fulfillment
      |
      +---> (On Failure: Trigger Compensating Transactions)
```

### Key takeaway
Designing Amazon requires a microservices architecture bounded by isolated domain data stores. Browsing and search rely heavily on CDN caching and distributed search indexes, while checkout uses Saga orchestration and distributed locking to guarantee transaction consistency across inventory and payments.
