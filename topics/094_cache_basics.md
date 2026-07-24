# Cache Basics

> **Category:** Caching

---

A **Cache** is a high-speed temporary storage layer used to store frequently accessed data in fast memory (RAM) so that future requests for that data can be served faster than fetching it from slower underlying storage (SSDs, relational databases, or third-party APIs).

### Multi-tier caching architecture

```
+---------------+     +---------------+     +---------------+     +---------------+
| Browser Cache | --> |   CDN Cache   | --> | App Memory DB | --> | Database Disk |
| (Local RAM)   |     | (Edge PoP)    |     | (Redis RAM)   |     | (NVMe / SSD)  |
+---------------+     +---------------+     +---------------+     +---------------+
  Latency: <1ms         Latency: 10-30ms      Latency: 1-5ms        Latency: 20-100ms
```

### Core caching concepts

1. **Cache Hit**: Requested data is present in the cache, returning immediately with low latency.
2. **Cache Miss**: Requested data is absent from the cache. The application fetches data from underlying persistent storage, writes it to the cache, and returns it to the client.
3. **Hit Ratio**: Percentage of total requests served successfully from cache ($	ext{Hit Ratio} = rac{	ext{Hits}}{	ext{Hits} + 	ext{Misses}}$). High hit ratios (>90%) indicate an effective caching strategy.
4. **Time-To-Live (TTL)**: Expiration timer assigned to cached items, automatically invalidating stale entries.

### Caching Layers Comparison Matrix

| Caching Tier | Location | Typical Storage Tech | Latency Range | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Client-Side** | User Device / Browser | Browser Cache, Service Worker | < 1 ms | Static assets, User session state |
| **CDN / Edge** | Edge Points of Presence | Cloudflare, Fastly | 10 – 30 ms | Images, JS/CSS, Static HTML |
| **Application Layer**| Microservice RAM / Distributed | Redis, Memcached | 1 – 5 ms | DB query results, User sessions, Objects |
| **Database Engine** | DB Buffer Pool RAM | MySQL Buffer Pool, Postgres Cache | 1 – 2 ms | Hot database pages & indexes |

### Key takeaway

Caching improves system read throughput and reduces response latency by storing hot data in fast memory tiers. Maximize cache hit ratios while setting appropriate TTLs to maintain data freshness.
