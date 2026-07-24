# Distributed Cache

> **Category:** Caching

---

A **Distributed Cache** is a caching system that pools the RAM of multiple server nodes into a single, cohesive in-memory data store. Distributed caches scale storage capacity and throughput horizontally beyond the memory limits of a single machine.

### System architecture

```
                     +-----------------------------------+
                     |         Application Tier          |
                     +-----------------------------------+
                         /             |             \
           Hash(Key)    /   Hash(Key)  |              \ Hash(Key)
          Consistent   /    Consistent |               \ Consistent
          Ring Node A /     Ring Node B|                \ Ring Node C
                     v                 v                 v
            +--------------+  +--------------+  +--------------+
            | Cache Node A |  | Cache Node B |  | Cache Node C |
            | (Redis/Memc) |  | (Redis/Memc) |  | (Redis/Memc) |
            +--------------+  +--------------+  +--------------+
```

### Core mechanisms & partitioning

1. **Data Partitioning (Consistent Hashing)**: Cache keys are partitioned across cluster nodes using consistent hashing algorithms to distribute memory load evenly and minimize key remapping during node failures.
2. **Replication & High Availability**: Redis Cluster maintains primary-replica pairs across nodes. If a primary cache node fails, a secondary replica is promoted automatically.
3. **Client-Side Routing / Cluster Proxies**: App clients use cluster-aware SDKs (e.g., Jedis, Lettuce) or proxies (Twemproxy, Envoy) to route key lookups directly to the correct shard node.

### Redis Cluster vs Memcached Comparison

| Feature | Redis Cluster | Memcached |
| :--- | :--- | :--- |
| **Data Structures** | Rich (Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps) | Simple Key-Value Strings only |
| **Persistence Options** | Supported (RDB Snapshots & AOF Logs) | Purely In-Memory (No disk persistence) |
| **Multithreading** | Primary single-threaded I/O (Multi-threaded I/O in v6+) | Native Multi-threaded architecture |
| **High Availability** | Built-in Auto-Failover & Primary-Replica Clustering | Requires external client-side routing logic |

### Key takeaway

Distributed caches pool RAM across server clusters to scale memory capacity and throughput horizontally. Use consistent hashing for key routing, and pair primary nodes with replicas to ensure high availability.
