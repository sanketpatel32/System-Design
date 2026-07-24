# Two Phase Commit

> **Category:** Distributed Systems

---

Two-Phase Commit (2PC) is a **synchronous distributed protocol** that ensures all participating database nodes in a distributed transaction either commit or abort the transaction atomically. It relies on a central Transaction Coordinator executing two sequential phases: the **Prepare Phase** and the **Commit Phase**.

### Two-Phase Commit Protocol Architecture

The coordinator polls all database cohort nodes to prepare locks and write log entries before issuing the global commit command.

```
+----------------------------------------------------------------------------------------------------+
|                                    Transaction Coordinator                                         |
+----------------------------------------------------------------------------------------------------+
       |                                                                          |
       | Phase 1: PREPARE Request ("Can you commit?")                             | Phase 1: PREPARE Request
       v                                                                          v
+----------------------------------+                                    +----------------------------------+
| Cohort Node A (Database 1)       |                                    | Cohort Node B (Database 2)       |
| - Locks local database records   |                                    | - Locks local database records   |
| - Writes undo/redo log entries   |                                    | - Writes undo/redo log entries   |
| - Responds "VOTE_COMMIT"         |                                    | - Responds "VOTE_COMMIT"         |
+----------------------------------+                                    +----------------------------------+
       |                                                                          |
       +----------------------------------+---------------------------------------+
                                          |
                        Coordinator receives unanimous VOTE_COMMIT
                                          |
       +----------------------------------+---------------------------------------+
       | Phase 2: GLOBAL COMMIT Command                                           | Phase 2: GLOBAL COMMIT Command
       v                                                                          v
+----------------------------------+                                    +----------------------------------+
| Cohort Node A                    |                                    | Cohort Node B                    |
| - Commits local transaction       |                                    | - Commits local transaction       |
| - Releases database locks        |                                    | - Releases database locks        |
| - Responds "ACK"                 |                                    | - Responds "ACK"                 |
+----------------------------------+                                    +----------------------------------+
```

### 2PC Protocol Execution Steps

1. **Phase 1 (Prepare Phase)**:
   - Coordinator allocates a transaction ID and sends a `PREPARE` message to all cohort nodes over the network.
   - Each cohort executes the transaction locally up to the commit point, writes undo/redo logs, locks resources, and responds with `VOTE_COMMIT` or `VOTE_ABORT`.
2. **Phase 2 (Commit Phase)**:
   - **If ALL cohorts vote `VOTE_COMMIT`**: Coordinator logs commit to its WAL and broadcasts `GLOBAL_COMMIT`. Cohorts finalize writes, release locks, and return `ACK`.
   - **If ANY cohort votes `VOTE_ABORT` (or times out)**: Coordinator broadcasts `GLOBAL_ABORT`. All cohorts rollback local changes using undo logs and release locks.

### 2PC Protocol State Matrix

| Coordinator Decision | Cohort Votes | Action Taken | Final State |
| :--- | :--- | :--- | :--- |
| Unanimous Agreement | All Cohorts vote `VOTE_COMMIT` | Issue `GLOBAL_COMMIT` | All Cohorts Commit Transaction |
| Partial Failure | 1+ Cohorts vote `VOTE_ABORT` | Issue `GLOBAL_ABORT` | All Cohorts Rollback Transaction |
| Timeout | Cohort does not respond to Prepare | Issue `GLOBAL_ABORT` | All Cohorts Rollback Transaction |

### Key Trade-offs & Critical Vulnerabilities

- ✅ **Strong ACID Guarantees**: Guarantees strict atomic consistency across multiple sharded databases.
- ❌ **Synchronous Blocking Protocol**: Cohort nodes hold database row locks throughout Phase 1 and Phase 2. High latency or network stalls block all concurrent database queries.
- ❌ **Coordinator Single Point of Failure**: If the coordinator crashes mid-way through Phase 2 after cohorts vote `VOTE_COMMIT`, cohort nodes are left in a **blocked, indeterminate state**, holding locks indefinitely.

### Key takeaway

Two-Phase Commit provides **strict distributed atomicity**, but its blocking lock behavior and coordinator vulnerability make it unsuitable for high-scale microservice architectures.
