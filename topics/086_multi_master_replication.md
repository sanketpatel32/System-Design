# Multi-Master Replication

> **Category:** Databases

---

Multi-master (multi-leader) replication = **multiple nodes accept writes**, each propagating
to the others. Enables write scaling and multi-region active-active.

### Topology
```
[Master 1] <---> [Master 2]
   |                |
   v                v
[Replicas]      [Replicas]
```

### Why
- **Write scaling** — distribute writes across nodes.
- **Multi-region** — writes in each region, no cross-region latency.
- **Always-on** — write even during network partitions.

### The big problem: conflicts
Two masters update the same row concurrently → conflict.

```
Master A: user.email = "a@x.com"
Master B: user.email = "b@x.com"
Both replicate to each other. Which wins?
```

### Conflict resolution strategies
| Strategy | How |
|----------|-----|
| **Last-write-wins (LWW)** | Use timestamp; newest wins. Simple, lossy. |
| **Vector clocks** | Detect concurrent writes; ask app to resolve. |
| **CRDTs** | Data structures that merge automatically (counters, sets). |
| **Custom logic** | Application-specific merge function. |
| **Avoid conflicts** | Partition writes by key so each key has one writer. |

### Replication topology
- **All-to-all**: every master replicates to every other. Simple, but O(N²).
- **Ring**: master N replicates to master N+1. Less traffic, more failure points.
- **Star**: one central master relays. Central is a bottleneck.

### Real-world
- **Cassandra, DynamoDB, Riak** — leaderless, tunable consistency, eventual.
- **CockroachDB, Spanner** — strongly consistent multi-region via consensus (Paxos/Raft).
- **MySQL Group Replication, BDR (Postgres)** — true multi-master with conflict handling.

### Trade-offs
- ✅ Write scaling, multi-region writes.
- ❌ Conflict resolution complexity.
- ❌ Hard to reason about consistency.
- ❌ Generally avoided unless you need geo-distributed writes.

### Key takeaway
Multi-master enables write scaling and multi-region writes but introduces **conflict
resolution** headaches. Use it only when needed (geo-distributed writes). Prefer single-leader
for simplicity; use CRDTs or consensus-based systems for the hard cases.
