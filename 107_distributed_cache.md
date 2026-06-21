# Distributed Cache

> **Category:** Caching

---

A distributed cache = **shared cache cluster across multiple nodes**. Lets all app instances
hit the same cache, with capacity beyond one machine.

### Why
- **Shared state**: any instance can serve any request.
- **Capacity**: shard across N nodes for more RAM.
- **Availability**: lose a node, others continue.
- **Hit rate**: shared cache → higher hit rate than per-instance.

### Architecture
```
[App 1] \
[App 2] --> [Cache cluster: Node A, B, C, ...]
[App 3] /
```
Data partitioned via **consistent hashing**. Each key lives on one node (plus replicas for
HA).

### Popular options
| | Notes |
|--|-------|
| **Redis Cluster** | Sharded Redis with built-in failover |
| **Memcached** | Simple, proven, large deployments (Facebook) |
| **Hazelcast** | In-memory data grid |
| **Aerospike** | RAM + SSD hybrid |
| **Caffeine + Redis** | Two-tier (local L1 + distributed L2) |

### Sharding
- Consistent hashing maps key → node.
- Add/remove nodes → minimal key movement.
- Each node holds ~K/N keys.

### Replication
- Each shard has primary + replicas.
- Reads can hit replicas (faster, slightly stale).
- Writes go to primary, replicate async.

### Consistency
- Most distributed caches are **eventually consistent**.
- Read-your-writes: stick to one node per session.
- Strong consistency: requires sync replication (slower).

### Failure handling
- Node down: that shard's data missing → fall through to DB.
- Network partition: split-brain possible; use quorum.

### Trade-offs vs single-node
- ✅ Scales capacity.
- ✅ HA.
- ❌ Network hop (still fast, but slower than in-process).
- ❌ Operational complexity.
- ❌ Consistency gotchas.

### Key takeaway
For multi-instance apps, use a **distributed cache** (Redis Cluster, Memcached) so all instances
share the same cache. Shard via consistent hashing. Accept eventual consistency; handle node
failure by falling through to DB.
