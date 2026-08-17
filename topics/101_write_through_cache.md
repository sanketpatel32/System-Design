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

### Partial-Failure Handling
"Atomic across two systems" is an aspiration, not a guarantee — the cache-then-DB sequence can fail in between:

| Failure Point | Symptom | Standard Response |
| :--- | :--- | :--- |
| DB write fails after cache updated | Cache newer than DB (dangerous) | Roll back the cache entry or mark it invalid; retry or surface the error to the caller. |
| Cache write fails after DB updated | Stale cache survives | Invalidate the key; next read repopulates via read-through. |
| Ack lost (write succeeded) | Caller retries a completed write | Idempotent writes or versioned keys prevent double-apply. |

Mission-critical systems treat write-through as *write-through with invalidation*: update the DB, then evict the cache entry, accepting one repopulation miss instead of risking divergence.

### When to Use Write-Through
- **Read-heavy + write-correct**: catalogs and config that are read constantly but written carefully — reads always hit warm cache, writes pay the sync tax.
- **Small write volume**: the latency penalty is per-write; a 1% write ratio hides it entirely.
- **Avoid for**: high-write hot keys (the sync DB write dominates; use write-behind with its durability caveats) and data the cache cannot faithfully represent.

### Operational Notes
- **Node failure**: a cache node that misses writes serves stale data after recovery — cluster replicas must propagate writes synchronously or nodes must invalidate on rejoin.
- **Metrics to watch**: write latency p99 (the cache+DB sum), divergence alarms (periodic cache-vs-DB checksum sampling), and cache-node write error rates.

### Key takeaway

Write-Through caching maintains strong consistency between cache and database layers by executing synchronous writes to both systems. Use it for critical data workloads where stale reads cannot be tolerated.
