# Cache Basics

> **Category:** Caching

---

A cache = **a faster, smaller store in front of a slower, larger store**. The most powerful
tool for reducing latency and load.

### Why cache
- **Latency**: RAM is 100,000x faster than disk.
- **Load**: absorb 80-95% of reads before they hit the DB.
- **Cost**: cheaper to scale cache than DB.

### The hit-rate curve
```
Hit rate
 100% |                     __________
      |                ___/
  80% |           ___/
      |      ___/
  50% | ___/
      |____________________________
        cache size
```
Diminishing returns past the hot set.

### Key decisions
1. **What to cache**: query results, computed objects, rendered HTML.
2. **Where**: in-process, local, distributed, CDN.
3. **TTL**: how long before expiry.
4. **Eviction policy**: LRU, LFU, FIFO.
5. **Invalidation**: how to keep in sync with source.
6. **Write strategy**: cache-aside, write-through, write-back.

### Caching layers (typical stack)
```
Browser cache       (HTTP responses)
    |
CDN edge cache      (static + dynamic content)
    |
App in-memory       (per-instance, fastest)
    |
Distributed cache   (Redis, Memcached, shared)
    |
Database cache      (Postgres shared_buffers)
```
Each layer catches a fraction of requests.

### Pitfalls
- **Stale data** — invalidation bugs.
- **Thundering herd** — cache miss floods the DB.
- **Memory pressure** — cache eats your RAM.
- **Hot keys** — one cached entry hammers a single Redis shard.

### Key takeaway
Caching is the single biggest lever for read latency. Layer it: browser → CDN → app memory →
Redis → DB. Pick TTL + eviction + write strategy deliberately. Always have an invalidation
plan.
