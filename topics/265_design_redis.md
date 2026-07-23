# Design Redis

> **Category:** Advanced System Design Problems

---

Design Redis itself: in-memory data store with rich types.

### Requirements
- **Functional**: KV + lists + sets + hashes + sorted sets + streams; pub/sub; scripting.
- **Non-functional**: microsecond latency; persistence optional.

### Architecture (single Redis instance)
- Single-threaded event loop.
- In-memory storage.
- Optional persistence (RDB snapshot + AOF log).

### Why single-threaded
- No locks / contention.
- Memory is fast; CPU isn't the bottleneck.
- Simple to reason about.

### Data structures
- Custom implementations (ziplist, skiplist, hashtable).
- Memory-efficient encodings for small data.

### Persistence
- **RDB**: periodic snapshot.
- **AOF**: append every write.
- Hybrid: RDB + AOF.

### Replication
- Async to replicas.
- Read from replicas (eventual).
- Sentinel for HA.

### Cluster
- Sharded via hash slots.
- Gossip for membership.
- Automatic failover.

### Key takeaway
Redis = single-threaded in-memory event loop + rich data types + optional persistence (RDB +
AOF) + async replication. Cluster adds sharding + failover. Simplicity gives speed.
