# Stateful Services

> **Category:** Scaling

---

A stateful service = **holds per-client or per-node state in memory or on local disk.** Hard
to scale but sometimes necessary.

### Examples
- **Databases** (Postgres, MySQL) — the data *is* the state.
- **Caches** (Redis, Memcached) — keys live in RAM.
- **WebSocket gateways** — open connections per client.
- **Message brokers** (Kafka) — partition leaders, in-memory buffers.
- **Game servers** — match state in memory.

### Why they're hard to scale
- **Can't just clone** — state differs per instance.
- **Need replication** for HA (write to N nodes).
- **Need sharding / partitioning** for scale (split keys across nodes).
- **Need consensus** for coordination (Raft, Paxos).
- **Failover is hard** — promoting a replica, rebalancing shards.

### Patterns for scaling stateful services
| Pattern | What it does |
|---------|--------------|
| **Read replicas** | Offload reads from primary |
| **Sharding** | Partition writes across nodes |
| **Consistent hashing** | Even partition + minimal movement |
| **Leader election** | One writer, followers replicate |
| **Quorum** | Tolerate minority failures |
| **Conflict resolution** | Multi-master (CRDTs, vector clocks) |
| **Externalized state** | Move state out (e.g. session to Redis) |

### Mitigation: externalize state
The cleanest fix is often to **turn a stateful service into a stateless one** by moving state
external:
- Sessions → Redis
- File uploads → S3
- Connection state → shared pub/sub

### Key takeaway
Stateful services are unavoidable (DBs, caches, queues, games). Plan for replication, sharding,
and failover from day one. **Externalize** state wherever possible to keep the rest of your
system stateless.
