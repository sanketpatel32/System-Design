# Design Distributed Cache

> **Category:** Distributed Systems Infrastructure

---

A Distributed Cache is an in-memory key-value data store deployed across a cluster of nodes to accelerate database reads, reduce query latency, and absorb traffic spikes.

### System Requirements
- **Functional Requirements**:
  - Store and retrieve key-value pairs in memory with sub-millisecond response times.
  - Support automatic item eviction when memory limits are reached.
  - Provide configurable TTL (Time-To-Live) expiration per cache entry.
- **Non-Functional Requirements**:
  - High Availability: Auto-failover and replication across nodes.
  - Horizontal Scalability: Partition key space evenly using consistent hashing.
  - Low Latency: Sub-2ms read and write operations.

### System Architecture
```
[ Application Client ] ---> [ Cache Client Proxy ]
                                    |
                 +------------------+------------------+
                 | (Consistent Hashing Ring with Virtual Nodes)
                 v                                     v
      [ Cache Node A (Master) ]             [ Cache Node B (Master) ]
                 |                                     |
                 v (Async Sync)                        v (Async Sync)
      [ Cache Node A (Replica) ]            [ Cache Node B (Replica) ]
```

### Eviction & Caching Strategy Trade-offs
| Eviction Policy | Mechanism | Ideal Use Case |
|---|---|---|
| **LRU (Least Recently Used)** | Evicts item untouched for the longest time | General-purpose web application caching. |
| **LFU (Least Frequently Used)** | Tracks access counts; evicts lowest count | Static content with stable popular items. |
| **ARC (Adaptive Replacement)** | Dynamically balances LRU and LFU | High-performance database buffer caches. |

| Pattern | Write Flow | Pros & Cons |
|---|---|---|
| **Cache-Aside** | App reads cache; on miss reads DB & writes cache | Resilient; stale data risk if DB updated directly. |
| **Write-Through** | App writes cache; cache updates DB synchronously | Strong consistency; higher write latency. |
| **Write-Back (Behind)** | App writes cache; cache async updates DB | Fast writes; risk of data loss if cache node crashes before DB sync. |

### Key takeaway
A distributed cache uses consistent hashing with virtual nodes to distribute keys across cluster nodes, leveraging eviction policies (LRU/LFU) and patterns (Cache-Aside) to deliver sub-millisecond data retrieval.
