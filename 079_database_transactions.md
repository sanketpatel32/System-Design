# Database Transactions

> **Category:** Databases

---

A transaction = **a unit of work that either fully completes or fully rolls back** —
all-or-nothing.

### Why
- Transfer $100 from A to B: debit A, credit B. If the system crashes between, you've either
  lost $100 or duplicated it.
- A transaction wraps both operations: either both succeed (commit) or neither does (rollback).

### Syntax
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- or ROLLBACK;
```

### ACID properties
- **Atomicity**: all or nothing.
- **Consistency**: DB moves from one valid state to another.
- **Isolation**: concurrent transactions don't interfere.
- **Durability**: committed data survives crashes.

### Isolation levels (see dedicated topic)
| Level | Dirty read | Non-repeatable read | Phantom |
|-------|-----------|---------------------|---------|
| Read uncommitted | Possible | Possible | Possible |
| Read committed | No | Possible | Possible |
| Repeatable read | No | No | Possible |
| Serializable | No | No | No |

Higher isolation = more correctness, less concurrency.

### When transactions matter
- **Financial**: money movement, ledger entries.
- **Inventory**: decrement stock + create order atomically.
- **Multi-step state machines**: order → paid → shipped.
- **Anything that must be atomic across tables**.

### When to avoid
- Long-running transactions hold locks, hurt concurrency.
- Distributed across services → use Saga pattern instead.

### Key takeaway
Wrap multi-step mutations in a transaction. Pick the **lowest isolation level** that's correct
for your business rule. Avoid long-running transactions (they hold locks).
