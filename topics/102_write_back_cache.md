# Write-Back Cache

> **Category:** Caching

---

A **Write-Back Cache** (also called Write-Behind Cache) is a caching pattern where write operations update the cache immediately and acknowledge success to the application. The cache layer asynchronously flushes updated ("dirty") data entries to the underlying persistent database in background batches.

### Pattern workflow

```
 [Application] ------ 1. Issue Fast Write ------> [Write-Back Cache (RAM)]
                                                        |
 3. App receives Instant Success ACK <------------------+
                                                        |
                                            2. Async Background Batch Flush
                                                        v
                                             [Primary Database Disk]
```

### Core mechanics & capabilities

1. **Decoupled Write Path**: Writes complete at memory speed (sub-millisecond), isolating the application from database write latency.
2. **Write Batching & Coalescing**: Multiple writes to the same record in cache are merged before being flushed to the database, reducing database write operations.
3. **Data Loss Risk**: If the cache node crashes before flushing dirty entries to disk, un-persisted updates are lost unless backed by persistent write logs or replica nodes.

### Write-Back Trade-Off Matrix

| Dimension | Evaluation | Technical Consequence |
| :--- | :--- | :--- |
| **Write Latency** | Ultra-Low | Operates at in-memory speed (< 1 ms) |
| **Database Load** | Significantly Reduced | Coalesces multiple updates into single batch writes |
| **Data Loss Risk** | High without Replication | Node failure before flushing risks losing dirty items |
| **Implementation Complexity**| High | Requires robust queueing, retry logic, and failover handlers |

### Durability Engineering
The data-loss window is the defining engineering problem. Production write-back layers stack defenses:

| Defense | Mechanism | Survives |
| :--- | :--- | :--- |
| **Persistent write log** (Redis AOF, group commit) | Every dirty mutation appended to disk log before ACK | Node crash, if log fsynced |
| **Synchronous replication** | Dirty writes forwarded to replicas before ACK | Node loss, if quorum acked |
| **Write queue with ack-on-flush** | Flush worker retries failed batches; queue itself persistent (Kafka-style) | Flush failures, node restart |
| **Tombstone + versioning** | Deletes and updates carry versions so replay order is deterministic | Queue reordering |

- **Flush ordering**: per-key ordering must be preserved when coalescing — flush the latest version per key, but never write a stale version after a newer one.
- **Backpressure bound**: the dirty-entry count must have a hard cap; at the cap, writes block or spill synchronously to the DB rather than growing unbounded memory.
- **Graceful shutdown**: drain the flush queue on SIGTERM — the classic lost-update bug is killing a cache node during deploy with 30 seconds of unflushed writes.

### Failure Scenarios
- **Cache node dies mid-flush**: partially applied batches must be idempotent (upserts by version), so replay after failover converges instead of duplicating.
- **Database slow → queue grows**: shed load by degrading to write-through for new writes while the queue drains; alert on queue depth age, not just depth.
- **Cold cache after failover**: reads miss and the DB absorbs read traffic exactly when it's weakest — warm replicas before promotion.

### Where Write-Back Shines
Counters, view counts, session state, shopping carts, metrics aggregation — high-frequency, low-value-per-write data where batching slashes DB load and a bounded loss window is acceptable. Avoid it for money movement and inventory: those need the database in the synchronous path.

### Key takeaway

Write-Back caching delivers high write performance and reduces database load by buffering updates in memory and flushing them asynchronously in batches. Mitigate data loss risks using persistent queues or replicated cache clusters.
