# Cache Stampede

> **Category:** Caching

---

A **Cache Stampede** (also known as the Thundering Herd Problem) occurs when a popular, high-traffic cache entry expires or is invalidated, causing thousands of concurrent user requests to experience a cache miss simultaneously. These requests all hit the primary database at once, causing severe database load, query timeouts, and potential system outages.

### Failure flow

```
                             [ Hot Cache Key Expires ]
                                         |
               +-------------------------+-------------------------+
               |                         |                         |
       Req 1 (Cache Miss)        Req 2 (Cache Miss)        Req N (Cache Miss)
               \                         |                         /
                +------------------------+------------------------+
                                         |
                                         v
                         +-------------------------------+
                         | 🔥 Database System Overload  |
                         | (Thousands of Parallel Reads) |
                         +-------------------------------+
```

### Mitigation strategies

1. **Mutex Locking (Single-Flight Pattern)**: On a cache miss, the first worker acquires a distributed lock (or local process mutex) to recalculate the item from the DB. Other requests block or poll until the cache is populated.
2. **Probabilistic Early Expiration (XFetch Algorithm)**: Automatically recomputes and refreshes cache entries before they expire, using a probability function based on read frequency and computation time.
3. **Background Periodic Refresh**: A background cron task updates hot cache items continuously before expiration, setting infinite TTLs for public user requests.

### Mitigation Strategies Comparison

| Strategy | Implementation Complexity | Primary Benefit | Trade-Off |
| :--- | :--- | :--- | :--- |
| **Mutex Locking (Single-Flight)**| Moderate | Guarantees only 1 DB query per cache miss | Concurrent client requests block briefly waiting for lock |
| **Probabilistic Early Expiration**| High (Requires XFetch math algorithm) | Eliminates cache misses entirely for hot keys | Slight increase in background compute load |
| **Background Cron Refresh** | Low-Moderate | Keeps hot items perpetually warm in cache | Requires maintaining explicit list of hot keys to refresh |

### Key takeaway

Prevent Cache Stampedes on high-traffic keys using Mutex Locks (Single-Flight) to ensure only one worker recomputes missing values, or implement Probabilistic Early Expiration (XFetch) to refresh hot items before they expire.
