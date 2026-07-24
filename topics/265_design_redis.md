# Design Redis

> **Category:** Distributed Systems Infrastructure

---

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine.

### System Requirements
- **Functional Requirements**:
  - Rich data structures (Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, HyperLogLogs, Streams).
  - In-memory persistence options (RDB snapshots and AOF append logs).
  - High-availability cluster mode with automatic partitioning and master-replica failover.
- **Non-Functional Requirements**:
  - Sub-Millisecond Execution: Process $100,000+$ ops/sec per single-core instance.
  - Deterministic Single-Threaded Core: Eliminate lock contention over memory structures.

### System Architecture
```
[ Client Applications ] ---> [ Redis Sentinel / Cluster Proxy ]
                                        |
                                        v
                            [ Redis Master Instance ]
                            (Single-Threaded Event Loop: epoll/kqueue)
                                   |           |
             +---------------------+           +---------------------+
             |                                                       |
             v                                                       v
   [ RDB Snapshot / AOF File ]                             [ Replica Node ]
   (Disk Persistence)                                      (Async Replication)
```

### Data Structures & Computational Complexity
| Data Structure | Internal Implementation | Common Use Case | Complexity |
|---|---|---|---|
| **String** | Simple Dynamic String (SDS) | Session caching, atomic counters (`INCR`) | $O(1)$ |
| **Hash** | ZipList / Hashtable | User profile objects | $O(1)$ |
| **List** | QuickList (Doubly Linked + ZipList) | Queue push/pop (`LPUSH`, `RPOP`) | $O(1)$ ends |
| **Sorted Set (ZSET)**| SkipList + Hashtable | Real-time leaderboards, Geohash spatial index | $O(\log N)$ |
| **HyperLogLog** | Probabilistic Cardinality Estimator | Unique visitor counting (DAU) | $O(1)$ |

### Persistence Trade-offs (RDB vs AOF)
- **RDB (Redis Database Snapshot)**: Point-in-time compact binary file. Ultra-fast restarts; minor data loss window between snapshots.
- **AOF (Append Only File)**: Logs every write command. Maximum durability (`fsync everysec`); larger file size and slower startup.

### Key takeaway
Redis achieves sub-millisecond execution by combining single-threaded event loops (epoll) with specialized in-memory data structures (SkipLists, SDS) backed by async RDB/AOF persistence and Sentinel cluster failover.
