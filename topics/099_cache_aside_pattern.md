# Cache Aside Pattern

> **Category:** Caching

---

Cache-aside (lazy loading) = **the app manages the cache explicitly** — check cache, on miss
query DB and fill cache.

### Flow
```
read(key):
    value = cache.get(key)
    if value is None:                  # cache miss
        value = db.query(key)
        cache.set(key, value, ttl=300) # fill cache
    return value
```

### Pros
- ✅ **Simple** — explicit, easy to reason about.
- ✅ **Cache only holds requested data** — no wasted space.
- ✅ **Cache failure is graceful** — fall through to DB.

### Cons
- ❌ **Cache stampede** — many concurrent misses flood the DB.
- ❌ **Stale data** — between DB update and TTL expiry.
- ❌ **Write complexity** — app must update/evict cache on writes.

### Mitigations
- **Stampede**: lock + single-fill (only one request queries DB, others wait) or "dogpile
  effect" prevention via probabilistic early expiration.
- **Staleness**: shorter TTL, event-driven invalidation, or write-through.

### Write path
```
write(key, value):
    db.update(key, value)
    cache.delete(key)   # invalidate; next read refills
```
Deleting (not updating) avoids race conditions where a stale read fills the cache after the
update.

### When to use
- **Read-heavy** workloads.
- **Cache miss is acceptable** (not for ultra-low-latency paths).
- **Heterogeneous data** with varying TTLs.

### Key takeaway
Cache-aside is the **default** caching pattern — simple and robust. On read miss, fill from DB.
On write, delete the cache entry (let next read repopulate). Mitigate stampedes with locks.
