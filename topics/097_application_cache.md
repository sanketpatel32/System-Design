# Application Cache

> **Category:** Caching

---

Application cache = **in-process or co-located cache inside the application tier**. Faster
than distributed cache because there's no network hop.

### Types
- **Per-instance** (LRU map, Caffeine, Guava): each app instance has its own cache.
- **Local off-heap** (Chronicle, Caffeine off-heap): avoids GC pressure.
- **Side-car / local SSD**: persistent, larger.

### Pros
- ✅ **No network hop** — sub-microsecond reads.
- ✅ Simple — no external dependency.
- ✅ Reduces load on distributed cache / DB.

### Cons
- ❌ **Per-instance** — each instance caches its own copy (wasted memory).
- ❌ **Inconsistent** — instance A's cache may differ from B's.
- ❌ **Memory pressure** — eats your app's heap.
- ❌ **Cold start** — new instance has empty cache.

### Best for
- **Reference data** that rarely changes (config, country codes).
- **Computed values** that are deterministic.
- **First-level cache** in front of Redis (two-tier caching).

### Two-tier caching
```
1. Check in-process (L1)   [hit?]  -> return
2. Check distributed (L2)  [hit?]  -> fill L1, return
3. Query DB                -> fill L1+L2, return
```
- L1 absorbs most reads (fast).
- L2 catches L1 misses and is shared.
- Trade-off: L1 staleness — keep L1 TTL short.

### Pitfalls
- **Memory leaks** — unbounded caches.
- **Stale data** — long TTL with no invalidation.
- **GC pressure** — large caches trigger long pauses.

### Key takeaway
In-process caches (L1) are the fastest layer. Use them for hot reference data and as a first
level in front of Redis. Keep them bounded (LRU + size cap) and TTL short to avoid staleness.
