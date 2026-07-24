# Write-Through Cache

> **Category:** Caching

---

A **Write-Through Cache** is a caching strategy where write operations update the cache and the underlying persistent database synchronously in a single atomic transaction. The application write operation completes only after both storage layers acknowledge the update.

### Pattern workflow

```
 [Application] ------ 1. Issue Write Request ------> [Write-Through Cache]
                                                           |
                                                   2. Synchronous Write
                                                           v
 [Client Confirmation] <--- 3. Acknowledge --- [Primary Database]
```

### Core characteristics & mechanics

1. **Synchronous Updates**: Write operations update the cache and database sequentially or in a unified transaction before returning success to the caller.
2. **Data Consistency**: Ensures the cache always reflects the latest database state, eliminating stale read windows.
3. **Write Latency Overhead**: Write latency equals the combined write times of the cache and database layers.

### Write-Through vs Write-Back vs Cache-Aside

| Strategy | Cache Update Timing | Database Update Timing | Consistency | Write Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Write-Through** | Immediate (Sync) | Immediate (Sync) | High | Higher (Sync DB write overhead) |
| **Write-Back (Behind)**| Immediate (Sync) | Delayed Async Batch | Temporary Lag | Ultra-low (App doesn't wait for DB) |
| **Cache-Aside** | App invalidates/updates | App writes directly to DB | Eventual | Standard DB write latency |

### Key takeaway

Write-Through caching maintains strong consistency between cache and database layers by executing synchronous writes to both systems. Use it for critical data workloads where stale reads cannot be tolerated.
