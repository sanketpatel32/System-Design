# Design Order Management System

> **Category:** E-Commerce and Payments

---

Design OMS: order lifecycle from placement to delivery.

### Requirements
- **Functional**: create order; track status; cancel; return; refund.
- **Non-functional**: durable; transactional.

### Order states
```
PENDING -> PAID -> PROCESSING -> SHIPPED -> DELIVERED
   |                                   |
   v                                   v
CANCELLED                            RETURNED -> REFUNDED
```

### Architecture
```
[Order API] -> [Order service] -> [Postgres (orders)]
                                 [State machine]
                                 [Event bus (Kafka)]
```

### Saga for order creation
1. Reserve inventory.
2. Charge payment.
3. Create order.
- Compensate on failure.

### Event-driven
- Each transition emits event.
- Downstream services react (shipping, notification).

### Data model
```
orders (id, user_id, status, total, created_at)
order_items (order_id, product_id, qty, price)
order_events (order_id, event_type, timestamp)
```

### Idempotency
- Order creation idempotent (idempotency key).
- Payment callback idempotent.

### Key takeaway
OMS = state machine (PENDING → PAID → SHIPPED → DELIVERED) + Saga for creation + event-driven
notifications. Idempotency on all mutations. Event log for audit.
