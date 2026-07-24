# Isolation Levels

> **Category:** Databases

---

**Isolation Levels** define the degree to which concurrently executing transactions are isolated from one another's updates. SQL standards specify four isolation levels, trading off execution concurrency against susceptibility to read anomalies (Dirty Reads, Non-Repeatable Reads, and Phantom Reads).

### Concurrency vs Isolation spectrum

```
  Strict Isolation                                                 High Performance
  Low Concurrency                                                  High Concurrency
  <--------------------------------------------------------------------------------->
  SERIALIZABLE  --->  REPEATABLE READ  --->  READ COMMITTED  --->  READ UNCOMMITTED
```

### Read anomalies defined

1. **Dirty Read**: Transaction A reads uncommitted data modified by Transaction B. If Transaction B rolls back, Transaction A holds invalid state.
2. **Non-Repeatable Read**: Transaction A reads a row, Transaction B modifies and commits that row. Transaction A reads the same row again and observes updated values.
3. **Phantom Read**: Transaction A queries a range of rows matching a condition. Transaction B inserts a new row matching that condition and commits. Transaction A re-runs the query and observes new "phantom" rows.

### Isolation levels comparison matrix

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Implementation Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Read Uncommitted** | Allowed | Allowed | Allowed | No read locks; reads raw uncommitted buffers |
| **Read Committed** | Prevented | Allowed | Allowed | MVCC (Reads newest committed snapshot per statement) |
| **Repeatable Read** | Prevented | Prevented | Allowed (Prevented in InnoDB)| MVCC (Snapshot created at transaction start) |
| **Serializable** | Prevented | Prevented | Prevented | Two-Phase Locking (2PL) / Range Locks / SSI |

### Multi-Version Concurrency Control (MVCC)

Modern database engines (PostgreSQL, MySQL InnoDB) implement isolation using **MVCC**:
- Instead of locking rows for reads, the database maintains historical row versions in Undo logs.
- Writers do not block readers, and readers do not block writers.
- Queries view a consistent snapshot corresponding to their isolation level timestamp.

### Key takeaway

Choose isolation levels based on consistency requirements. Use `READ COMMITTED` for high-throughput OLTP systems, `REPEATABLE READ` for financial calculations, and `SERIALIZABLE` only when concurrent range anomalies cannot be tolerated.
