# Read Replicas

> **Category:** Scaling

---

Read replicas = **asynchronous copies of the primary database** that serve read traffic. The
cheapest way to scale read-heavy workloads.

### Topology
```
       writes
Client ------> [Primary] --replicate--> [Replica 1]
                                \----> [Replica 2]
                                \----> [Replica 3]
       reads
Client ------> [Replica N]   (load balanced)
```

### Why
- **Offload reads** — most apps are read-heavy (10:1).
- **Scale reads horizontally** — add replicas, spread load.
- **Analytics** — run heavy queries on a replica, not the primary.
- **HA** — promote a replica if the primary dies.

### Replication lag
- Replication is **asynchronous** (in most setups) for performance.
- Typical lag: milliseconds to seconds.
- After a write, reads from replicas may be **stale** for a brief window.

### Read-your-writes consistency
User posts a comment → refreshes → comment missing (read went to a replica behind by 200ms).
Fixes:
- Read from **primary** for X seconds after the user's write.
- Use **session stickiness** at the LB.
- Use **synchronous replication** (slower, lower availability).

### When replicas don't help
- **Write-heavy** workloads — writes still go to one primary.
- **Strong consistency** requirements — replicas are stale.
- **Cross-shard queries** — replicas mirror one shard's data.

### Promotion (failover)
- Primary dies → promote a replica (RDS does this in 30s-2min).
- Replication lag = **data loss** on failover (the un-replicated writes).

### Key takeaway
Read replicas are the **first** scaling move for read-heavy apps. Plan for replication lag
(read-your-writes, sticky sessions) and use one as a failover candidate. They don't scale
writes — for that you need sharding.
