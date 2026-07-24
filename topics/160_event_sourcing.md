# Event Sourcing

> **Category:** Distributed Systems

---

Event Sourcing is an architectural pattern where **all changes to application state are stored as an append-only sequence of immutable events** (an Event Store). Instead of mutating the current state of a record in a database, the system appends every state change event chronologically, deriving the current state by replaying the event log.

### Event Sourcing Architecture & Snapshot Engine

Application state is represented as an append-only event stream, using periodic state snapshots to optimize event replay performance.

```
+----------------------------------------------------------------------------------------------------+
| Application Event Store (Append-Only Immutable Log)                                                |
|                                                                                                    |
| [ Event 1: AccountCreated (ID: 101, Balance: $0) ]                                                |
|                       v                                                                            |
| [ Event 2: MoneyDeposited (ID: 101, Amount: +$100) ]                                               |
|                       v                                                                            |
| [ Event 3: MoneyWithdrawn (ID: 101, Amount: -$30) ]  ==> Current State: Balance = $70               |
|                       v                                                                            |
| [ Snapshot #1 Generated: State = $70 at Event 3 ]                                                  |
|                       v                                                                            |
| [ Event 4: MoneyDeposited (ID: 101, Amount: +$50) ]  ==> Replay Snapshot #1 + Event 4 = $120        |
+----------------------------------------------------------------------------------------------------+
```

### Traditional State Mutation vs Event Sourcing Matrix

| Dimension | Traditional State Storage | Event Sourcing |
| :--- | :--- | :--- |
| **Data Modification** | Mutates existing row (`UPDATE accounts SET balance = 70`) | Appends new event record (`MoneyWithdrawn`) |
| **Audit Trail** | Destroys previous state unless audit logs enabled | Built-in, 100% accurate historical audit log |
| **State Recovery** | Must rely on database backups / Point-in-time recovery | Replay events from origin to rebuild any past state |
| **Immutability** | Mutable | 100% Immutable (Append-only) |
| **Primary Use Cases** | CRUD web applications | Financial ledgers, trading systems, domain modeling |

### Key Mechanics & Performance Patterns

1. **Snapshots**: To prevent replaying millions of events from beginning of time, the system periodically saves state snapshots (e.g. every 1,000 events). State reconstruction loads the latest snapshot and replays only subsequent events.
2. **CQRS Integration**: Event Sourcing is almost always paired with **CQRS**. The Event Store acts as the write command log, and projection workers consume events to build denormalized read views.

### Key Trade-offs & Implementation Risks

- ✅ **Complete Auditability & Time Travel**: Allows querying the exact state of any domain entity at any point in history.
- ✅ **Eliminates Object-Relational Impedance**: No complex ORM mapping required for write operations.
- ❌ **Event Schema Evolution**: Modifying event payloads over time requires managing event versioning and upcasters.
- ❌ **Storage Growth**: Append-only logs grow continuously and cannot be deleted.
### Production Event Store Record Schema

```sql
CREATE TABLE event_store (
    sequence_number  BIGSERIAL PRIMARY KEY,
    aggregate_id     UUID NOT NULL,
    aggregate_type   VARCHAR(64) NOT NULL,
    event_type       VARCHAR(64) NOT NULL,
    event_payload    JSONB NOT NULL,
    metadata         JSONB NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_aggregate_seq ON event_store(aggregate_id, sequence_number);
```

### Key takeaway

Event Sourcing captures **all application state changes as an immutable append-only event sequence**, enabling complete auditability, time-travel debugging, and seamless CQRS integration.
