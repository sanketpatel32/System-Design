# CQRS

> **Category:** Distributed Systems

---

CQRS = **Command Query Responsibility Segregation** — separate the write model (commands)
from the read model (queries).

### The idea
```
Traditional CRUD: one model handles reads + writes.
CQRS:
   Write side: Commands -> Write Model (optimized for writes, normalized)
   Read side:  Queries -> Read Model  (optimized for reads, denormalized)
```
The two models are kept in sync (typically via events).

### Why
- **Reads and writes have different shapes**: writes care about consistency; reads care about
  speed.
- **Different scale**: 100x more reads than writes.
- **Different consumers**: write model = service; read model = dashboards, search.

### Example: e-commerce
- **Write model** (Postgres): `orders`, `order_items`, normalized.
- **Read model** (Elasticsearch): "user's orders with item details" pre-joined.
- Sync: write to Postgres → emit event → update ES.

### Synchronization
- **Event-driven**: write publishes event, read model updates.
- **CDC**: stream DB changes to read model.
- **Materialized views**: DB-level (Postgres).

### When CQRS helps
- Read-heavy workloads with complex queries.
- Multiple read shapes (per-user, per-tenant, analytics).
- Independent scaling of reads vs writes.

### When NOT to use
- Simple CRUD with one read shape.
- Small apps.
- Adds complexity (sync, eventual consistency).

### CQRS + Event Sourcing
- Common pairing.
- Writes are events (append-only log).
- Read models built by replaying events.
- Powerful but complex.

### Trade-offs
- ✅ Optimize each side independently.
- ✅ Scale reads and writes independently.
- ✅ Different read shapes.
- ❌ **Eventual consistency** between models.
- ❌ Complexity (two models, sync).
- ❌ Harder debugging.

### Key takeaway
CQRS separates **write** (command) and **read** (query) models, optimized independently. Use it
when reads dominate and have multiple shapes. Sync via events or CDC. Accept eventual
consistency between the two sides.
