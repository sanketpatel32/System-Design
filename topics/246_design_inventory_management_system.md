# Design Inventory Management System

> **Category:** E-Commerce and Payments

---

Design inventory: track stock levels per product, prevent overselling.

### Requirements
- **Functional**: stock levels; reserve on order; release on cancel; restock alerts.
- **Non-functional**: prevent overselling at high concurrency.

### Architecture
```
[Order] -> [Inventory service] -> [DB]
                                 [Reservations table]
```

### The overselling problem
- Only 1 item left.
- Two orders check stock at same time → both see 1 → both succeed → oversold.

### Solutions

#### Pessimistic locking
- `SELECT ... FOR UPDATE` on the row.
- Block concurrent readers.
- Slow but safe.

#### Optimistic locking
- Version field.
- `UPDATE stock WHERE id = X AND version = Y`.
- Retry on conflict.

#### Atomic decrement
```sql
UPDATE inventory SET count = count - 1
WHERE product_id = X AND count > 0
```
- Atomic; fails if no stock.

### Reservations
- Reserve on order placement.
- Confirm on payment.
- Release on cancel / timeout.

### Data model
```
inventory (product_id, count, reserved_count)
reservations (id, order_id, product_id, qty, expires_at)
```

### Restock alerts
- Threshold per product.
- Alert when below.

### Key takeaway
Inventory = atomic stock decrements (or optimistic locking) + reservations table. Reserve on
order, confirm on payment, release on cancel. Atomic SQL update prevents overselling.
