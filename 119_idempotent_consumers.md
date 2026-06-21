# Idempotent Consumers

> **Category:** Message Queues and Event Streaming

---

An idempotent consumer = **processing the same message multiple times has the same effect as
processing it once.** Mandatory with at-least-once delivery.

### Why
- Queues deliver at-least-once → duplicates are normal.
- Network blips cause ACK to be lost → message redelivered.
- Retries produce duplicates.

Without idempotency:
- Charge customer twice for one order.
- Send notification twice.
- Increment counter twice.

### How to be idempotent

#### 1. Unique message ID + dedup
```python
if processed_ids.contains(msg.id):
    return  # already done
process(msg)
processed_ids.add(msg.id)
```
Store IDs in DB / Redis (with TTL).

#### 2. Natural idempotency
Operation is naturally idempotent (e.g. `SET x = 5` is idempotent; `x = x + 1` is not).

#### 3. State machine
Only valid transitions accepted:
```
PENDING -> PAID -> SHIPPED
PAID -> PENDING (rejected as invalid)
```
Redelivering "PAID" when already PAID is a no-op.

#### 4. Optimistic locking
```
UPDATE accounts
SET balance = balance - 100
WHERE id = 1 AND version = ?
```
If version mismatch → no-op (already applied).

#### 5. DB constraints
```
UNIQUE(order_id)  -- prevents double-processing
```

### Anti-pattern
Just assume "I'll process once." Network failures, restarts, retries — duplicates happen.
**Always design for duplicates.**

### Key takeaway
At-least-once delivery means consumers receive duplicates. Design idempotency via **message ID
dedup**, natural idempotent ops, state machines, or unique constraints. Test by replaying the
same message N times — result should be the same as once.
