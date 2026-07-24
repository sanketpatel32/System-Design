# ACID Properties

> **Category:** Databases

---

**ACID** is an acronym representing the four foundational guarantees of relational database management systems: **Atomicity**, **Consistency**, **Isolation**, and **Durability**. Together, ACID properties guarantee data integrity across concurrent executions and hardware failures.

### Architecture relationship

```
                          [ ACID GUARANTEES ]
                                   |
       +------------------+--------+--------+------------------+
       |                  |                 |                  |
       v                  v                 v                  v
+--------------+   +--------------+  +--------------+   +--------------+
|  ATOMICITY   |   | CONSISTENCY  |  |  ISOLATION   |   | DURABILITY   |
| (All or None)|   | (Valid State)|  | (Concurrency)|   | (Persisted)  |
+--------------+   +--------------+  +--------------+   +--------------+
       |                  |                 |                  |
   Undo Logs /        Foreign Keys /    Locks / MVCC        Redo Logs /
   Rollbacks         Constraints        Snapshots              WAL
```

### Breakdown of ACID Guarantees

1. **Atomicity ("All or Nothing")**: Guarantees that all statements within a transaction complete successfully. If any statement fails, the entire transaction is rolled back, leaving the database in its pre-transaction state. *Enforced via Undo Logs.*
2. **Consistency ("Valid State Transitions")**: Guarantees that a transaction moves the database from one valid schema state to another, maintaining all schema constraints (`FOREIGN KEY`, `NOT NULL`, `CHECK`).
3. **Isolation ("Concurrent Execution Integrity")**: Guarantees that concurrently executing transactions do not interfere with one another, producing results equivalent to running them sequentially. *Enforced via MVCC and Locks.*
4. **Durability ("Permanent Storage")**: Guarantees that once a transaction commits, its modifications survive any subsequent system crash or power outage. *Enforced via Write-Ahead Logging (WAL) and disk flushes.*

### ACID Implementation Matrix

| Property | Database Enforcement Mechanism | Potential Vulnerability / Failure Mode |
| :--- | :--- | :--- |
| **Atomicity** | Undo Logs & Transaction Abort Handlers | Unhandled app exceptions leaving connections open |
| **Consistency** | Schema Constraints, Triggers, Domain Checks | Application-level validation bugs |
| **Isolation** | Lock Managers (2PL), Multi-Version Concurrency Control (MVCC) | Read anomalies (Dirty Reads, Non-Repeatable Reads, Phantoms) |
| **Durability** | Non-volatile Write-Ahead Logs (WAL) flushed to disk (`fsync`) | Disk hardware failure without secondary replication |

### ACID vs BASE (NoSQL)

Relational databases prioritize strict ACID guarantees. Distributed NoSQL databases often adopt **BASE** (**B**asically **A**vailable, **S**oft-state, **E**ventual consistency) to favor horizontal availability and scaling over immediate consistency.

### Key takeaway

ACID properties ensure database reliability. Atomicity guarantees all-or-nothing execution, Consistency preserves schema rules, Isolation manages concurrent access, and Durability ensures committed updates persist.
