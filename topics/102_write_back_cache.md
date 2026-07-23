# Write Back Cache

> **Category:** Caching

---

Write-back (write-behind) = **the app writes only to cache; the cache asynchronously writes
to DB later.** Maximum write performance.

### Flow
```
write(key, value):
    cache.set(key, value)              # 1. write to cache only
    # return immediately
    # async: eventually flush to DB
```

### Pros
- ✅ **Ultra-low write latency** — no waiting for DB.
- ✅ **Batching** — many writes coalesce into one DB write.
- ✅ **Absorbs spikes** — DB sees smooth load.

### Cons
- ❌ **Data loss risk** — cache crash before flush loses writes.
- ❌ **Complexity** — need durable cache, flush logic.
- ❌ **Ordering** — must preserve write order.
- ❌ **Read inconsistency** — DB lags cache.

### Mitigations
- **Replicate the cache** (Redis + persistence).
- **Persist cache writes to a WAL**.
- **Frequent flushes** (every 1s) bound data loss.
- **Idempotent writes** so re-flush is safe.

### Use cases
- **Logging / metrics** — accept tiny loss, max throughput.
- **Counters / analytics** — write heavy, read infrequent.
- **Gaming leaderboards** — bursty writes.
- **Database Buffer Pool** — DB pages flushed lazily (Postgres/MySQL).

### Variants
- **Write-behind with async workers**: cache emits events, workers persist.
- **Time-based flush**: flush dirty entries every N seconds.
- **Count-based flush**: flush after K writes.

### Key takeaway
Write-back trades durability for write speed. Use it for high-throughput, loss-tolerant
workloads (logs, metrics, counters). Never use it for transactional data where loss is
unacceptable. Always have a flush / persistence plan.
