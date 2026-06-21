# Write Through Cache

> **Category:** Caching

---

Write-through = **the app writes to cache and DB synchronously, in that order**. Cache is
always consistent with DB.

### Flow
```
write(key, value):
    cache.set(key, value)   # 1. update cache
    db.update(key, value)   # 2. update DB (synchronously)
    return
```

### Pros
- ✅ **Strong consistency** — cache always matches DB.
- ✅ **No stale reads** — read sees the latest write.
- ✅ Simple reasoning.

### Cons
- ❌ **Higher write latency** — must wait for both cache and DB.
- ❌ **Cache churn** — even rarely-read data gets cached.
- ❌ **Failure handling** — what if cache write fails after DB write? Or vice versa?

### Failure scenarios
- DB write fails: rollback cache write (or never happened).
- Cache write fails: DB has new value, cache has old. Until TTL, reads are stale.
  → Typically: retry, then log/alert.

### When to use
- Read-heavy workloads where staleness is unacceptable.
- Data that changes infrequently (writes are rare, latency is OK).
- Banking / configuration / inventory.

### When NOT to use
- Write-heavy workloads (write latency doubles).
- Paths where the cached data is rarely read.

### vs Cache-aside
| | Cache-aside | Write-through |
|--|-------------|---------------|
| Write | Update DB, delete cache | Update cache + DB |
| Staleness | Possible (until TTL) | None |
| Write latency | One DB write | Cache + DB writes |

### Key takeaway
Write-through gives **strong consistency** at the cost of write latency. Use it for data where
staleness is unacceptable and writes are infrequent. For high-write workloads, cache-aside +
TTL is better.
