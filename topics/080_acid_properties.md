# ACID Properties

> **Category:** Databases

---

ACID = **Atomicity, Consistency, Isolation, Durability** — the four guarantees of a
transactional database.

### Atomicity
> "All or nothing."
Either all operations in the transaction succeed, or none do. No partial state.

```sql
BEGIN;
  debit(A, 100);
  credit(B, 100);   -- if this fails, the debit is rolled back too
COMMIT;
```

### Consistency
> "Valid state to valid state."
The DB enforces constraints (PK, FK, CHECK, UNIQUE). A transaction can't leave the DB in an
inconsistent state.

### Isolation
> "Concurrent transactions don't interfere."
Two transactions running concurrently produce the same result as if they ran sequentially
(at the highest level — serializable).

Lower levels trade isolation for performance:
- **Read committed** (default in Postgres): no dirty reads.
- **Repeatable read**: same query returns same result within a transaction.
- **Serializable**: as if sequential.

### Durability
> "Committed data survives crashes."
Once `COMMIT` returns, the data is on disk (WAL flushed) — even if the power dies.

Achieved via **WAL** (write-ahead log) + `fsync` before commit ack.

### Trade-offs
- ACID is **expensive**: locks, sync I/O, coordination.
- Distributed ACID (2PC) is even more expensive and brittle.
- NoSQL often trades ACID for **BASE** (Basically Available, Soft state, Eventual consistency).

### Real-world
- Postgres/MySQL: full ACID.
- MongoDB: ACID since 4.0 (multi-doc transactions).
- Cassandra: tunable consistency, not full ACID.
- DynamoDB: ACID only within a single item; transactions supported but limited.

### Key takeaway
ACID guarantees correctness under concurrency and failures. It's the default for transactional
data (OLTP). Trade it away deliberately (and knowingly) when you need massive scale or
availability.
