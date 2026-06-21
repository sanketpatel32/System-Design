# Master-Slave Replication

> **Category:** Databases

---

Master-slave (now often called **primary-replica** or **leader-follower**) replication = one
node accepts writes, others replicate and serve reads.

### Topology
```
       writes
Clients ------> [Primary]
                    |
                    | replicate (async)
                    v
              [Replica 1]
              [Replica 2]
              [Replica 3]
       reads (load balanced)
```

### How writes flow
1. Client sends write to primary.
2. Primary applies, writes to WAL, commits.
3. Primary ships WAL records to replicas (async or sync).
4. Replicas apply the changes.

### Reads
- Reads can go to **any** replica.
- LB round-robins among them.
- Trade-off: replication lag → potentially stale reads.

### Failover
- If primary dies, promote a replica.
- Update connection strings / DNS.
- **Replication lag = data loss** at the moment of failover (un-replicated writes).

### Pros
- ✅ **Simple** — one writer, easy reasoning.
- ✅ **Scales reads** — add replicas freely.
- ✅ **HA** — promote on failure.

### Cons
- ❌ **Write bottleneck** — all writes hit one node.
- ❌ **Failover complexity** — promoting must be automated.
- ❌ **Stale reads** — async replication lag.

### Real-world
- Postgres streaming replication.
- MySQL with read replicas.
- RDS / Aurora built-in.

### Multi-AZ vs Multi-region
- **Multi-AZ**: primary in AZ-a, sync replica in AZ-b. Survives AZ loss.
- **Multi-region**: primary in region-1, async replica in region-2. Survives region loss, with
  replication lag.

### Key takeaway
Primary-replica is the default for OLTP. Scales reads well; doesn't scale writes. Plan failover
(promotion) carefully and accept that **replication lag = data loss on failover** for async
setups.
