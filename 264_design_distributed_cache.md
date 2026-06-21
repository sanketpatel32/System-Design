# Design Distributed Cache

> **Category:** Advanced System Design Problems

---

Design a distributed cache like Redis Cluster.

### Requirements
- **Functional**: get/set/delete; TTL; eviction.
- **Non-functional**: low-latency (<1ms); HA; scalable.

### Architecture
```
[Clients] -> [Cluster of N nodes]
              Each node owns a hash range (consistent hashing)
              Replication: primary + replicas per shard
```

### Sharding
- Consistent hashing (with vnodes).
- Key → node via ring.
- Add/remove nodes → minimal movement.

### Replication
- Each shard has primary + replicas.
- Writes to primary, replicate async.
- Promote replica on failure.

### Consistency
- Eventually consistent (async replication).
- Read-your-writes: read from primary.

### Eviction
- LRU / LFU / TTL.
- Configurable maxmemory.

### Failover
- Detect failed primary (gossip + quorum).
- Promote a replica.
- Update routing.

### Redis Cluster specifics
- 16384 hash slots.
- Each node owns a range.
- MOVED / ASK redirections.

### Key takeaway
Distributed cache = consistent hashing + primary-replica per shard + gossip for membership +
automatic failover. Trade eventual consistency for availability. LRU/LFU/TTL eviction.
