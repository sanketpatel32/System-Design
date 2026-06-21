# Design Amazon

> **Category:** E-Commerce and Payments

---

Design Amazon: browse, search, cart, order, payment, fulfillment.

### Requirements
- **Functional**: catalog, search, cart, checkout, payment, order tracking, reviews.
- **Non-functional**: high availability; massive scale.

### Architecture
```
[Client] -> [API Gateway]
              |
              +-> [Catalog] (product info)
              +-> [Search] (ES)
              +-> [Cart service]
              +-> [Order service]
              +-> [Payment service]
              +-> [Inventory service]
              +-> [Recommendation service]
```

### Services
- **Catalog**: product info, prices.
- **Search**: ES index of products.
- **Cart**: per-user cart (Redis).
- **Order**: order lifecycle (Saga).
- **Payment**: charge, refund.
- **Inventory**: stock levels.
- **Fulfillment**: shipping.

### Data partitioning
- Per-tenant for B2B.
- Time-series for orders.

### Caching
- Product pages heavily cached.
- CDN for images.
- Redis for cart + session.

### Saga for checkout
1. Create order.
2. Reserve inventory.
3. Charge payment.
4. Confirm.
- Compensations on failure.

### Key takeaway
Amazon = many microservices (catalog, search, cart, order, payment, inventory) + CDN + cache +
Saga for checkout transactions. Each service scales independently. Caching dominates for
browsing.
