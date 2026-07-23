# Event Sourcing

> **Category:** Distributed Systems

---

Event sourcing = **store the system's state as an append-only log of events**, rather than
just the current state.

### The idea
```
Traditional: store current state.
   account.balance = 100

Event-sourced: store every event.
   AccountCreated(id=1)
   Deposited(id=1, amount=150)
   Withdrew(id=1, amount=50)
   Current balance: replay events = 100
```

### Why
- **Audit**: complete history.
- **Time travel**: reconstruct any past state.
- **Reproducibility**: replay to debug.
- **Multiple read models**: build different views from same events.
- **Recovery**: re-apply events after a fix.

### Architecture
```
1. Command arrives (e.g. "deposit 50").
2. App validates, computes new events.
3. Appends events to event store (atomic).
4. Events published to message broker.
5. Projectors update read models (DB, search, cache).
6. Queries read from read models.
```

### Event store
- Append-only log (Kafka, EventStoreDB, DynamoDB, Postgres).
- Events immutable, ordered.
- Snapshotting: periodically save state to avoid full replay.

### CQRS pairing
- Event sourcing writes events.
- CQRS read models project events to queryable form.

### Trade-offs
- ✅ Auditability, temporal queries, multiple views.
- ✅ Decoupling (events are the contract).
- ❌ Complexity (event versioning, schema evolution).
- ❌ Storage (events accumulate).
- ❌ Latency (replay on cold reads).

### Event versioning
- Schema evolves over years.
- Upcasters: transform old events to new schema.
- Hard problem; plan for it.

### Real-world
- Financial (every transaction matters).
- Order systems (lifecycle tracking).
- Inventory (stock changes over time).
- Audit-heavy compliance systems.

### Key takeaway
Event sourcing stores **changes** (events) instead of current state. Pairs naturally with CQRS.
Best for audit-heavy, evolving systems. Costs: complexity (event versioning, projections, snapshotting).
