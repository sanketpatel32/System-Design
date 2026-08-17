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

### Key takeaway

Write-Back caching delivers high write performance and reduces database load by buffering updates in memory and flushing them asynchronously in batches. Mitigate data loss risks using persistent queues or replicated cache clusters.
