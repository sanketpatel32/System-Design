# Event Sourcing

> **Category:** Distributed Systems

---

Event Sourcing is an architectural pattern where **all changes to application state are stored as an append-only sequence of immutable events** (Event Log), rather than overwriting current-state database records.

### Event Sourcing Architecture & Snapshots

```
+-----------------------------------------------------------------------------------+
|                        Immutable Event Store (Append-Only Log)                    |
+-----------------------------------------------------------------------------------+
| Event 1: AccountOpened ($0)  --> Event 2: Deposited ($100) --> Event 3: Withdrew ($30)|
+-----------------------------------------------------------------------------------+
                                          |
                                          v Replay / Materialize State
                                +-------------------+
                                | Calculated Balance|
                                | = $70             |
                                +-------------------+
                                          ^
                                          | Performance Optimization
                                +-------------------+
                                | Periodic Snapshot |
                                | (State at Event 200)
                                +-------------------+
```

### Event Sourcing vs Traditional CRUD

| Feature | Traditional CRUD Database | Event Sourcing Pattern |
| :--- | :--- | :--- |
| **Data Storage** | Current state only (`UPDATE balance SET value=70`)| Immutable append-only log (`INSERT INTO events`)|
| **Auditability** | Destructive overwrites lose historical context | 100% audit log of every change over time |
| **State Recovery** | Requires restoring backup dumps | Replay event sequence to any point in time |
| **Query Complexity**| Simple SQL queries | Requires projection layers or snapshots |

### Performance Optimization via Snapshots

- **State Snapshots**: To prevent replaying millions of events from genesis to compute current state, systems write periodic state snapshots (e.g. every 1,000 events) and replay only subsequent new events.

### Key takeaway

Event sourcing captures **every system change as an immutable event stream**, providing complete auditability, precise temporal state replay, and reliable event-driven architecture integration.
