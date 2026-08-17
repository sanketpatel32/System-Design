# Database Transactions

> **Category:** Databases

---

A **Database Transaction** is a sequence of one or more database operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) executed as a single, atomic unit of work. A transaction either completes entirely (**Commit**) or leaves the database unchanged (**Rollback**), ensuring data integrity despite application crashes, power outages, or network failures.

### Transaction lifecycle

```
                       +-----------------------+
                       |    BEGIN TRANSACTION  |
                       +-----------------------+
                                   |
                                   v
                       +-----------------------+
                       |  Execute SQL Operations|
                       +-----------------------+
                                  / \
                   Success       /   \      Failure / Exception
                                /     \
                               v       v
                   +---------------+ +---------------+
                   | COMMIT        | | ROLLBACK      |
                   | (Persist)     | | (Revert WAL)  |
                   +---------------+ +---------------+
```

### Core transaction mechanisms

1. **Write-Ahead Logging (WAL)**: Database changes are appended sequentially to an on-disk transaction log before modifying actual database pages in RAM or disk. If a crash occurs, the engine replays the WAL to recover state.
2. **Undo/Redo Logs**: 
   - **Undo Logs**: Store pre-mutation record states to revert changes if a transaction issues a `ROLLBACK`.
   - **Redo Logs**: Store post-mutation record states to re-apply committed changes that were not yet flushed to disk during a crash.
3. **Two-Phase Locking (2PL)**: Locks records during transaction execution to prevent conflicting concurrent updates.

### Transaction control commands

| Command | Purpose | Action |
| :--- | :--- | :--- |
| **`BEGIN` / `START TRANSACTION`** | Initiates transaction context | Allocates transaction ID (TxID) and Undo log buffer |
| **`SAVEPOINT <name>`** | Sets a intermediate restore point | Allows partial rollback to savepoint without aborting entire transaction |
| **`COMMIT`** | Finalizes the transaction | Flushes Redo log to disk; makes changes visible to other transactions |
| **`ROLLBACK`** | Aborts the transaction | Reverts all uncommitted changes using Undo logs |

### Distributed transactions consideration

Single-database transactions rely on local database engines. Distributed transactions across microservices require protocols like **Two-Phase Commit (2PC)** or **Saga Patterns** (Choreography/Orchestration) to handle cross-network atomicity.

### Key takeaway

Database transactions guarantee that multi-step operations execute atomically. Engines maintain data safety across system failures using Write-Ahead Logging (WAL) and Undo/Redo buffers.
