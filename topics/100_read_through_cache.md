# Read-Through Cache

> **Category:** Caching

---

A **Read-Through Cache** is an architectural pattern where the application treats the cache as its primary datastore. On a cache miss, the cache layer transparently fetches the missing data from the underlying database, populates itself, and returns the result to the application.

### Pattern workflow

```
 [Application] ------ 1. Request Data (`Get Key`) ------> [Read-Through Cache]
                                                                |
                                             +------------------+------------------+
                                             |                                     |
                                        2a. Cache Hit                         2b. Cache Miss
                                             |                                     |
                                             v                                     v
                                    [Return Cached Data]                 [Cache Reads DB]
                                                                                   |
                                                                                   v
                                                                             [Database]
```

### Comparison: Read-Through vs Cache-Aside

| Feature | Read-Through Cache | Cache-Aside Pattern |
| :--- | :--- | :--- |
| **Orchestrator** | Cache middleware/library fetches from DB | Application code fetches from DB on cache miss |
| **Code Simplicity** | Clean application logic (Single datastore interface) | Application manages DB fallbacks and cache writes |
| **Data Model Alignment**| Data model in cache must match DB schema | Application can transform DB data before caching |
| **Infrastructure Support**| Requires plugins or specialized frameworks (e.g., NCache) | Standard Redis/Memcached client libraries |

### Freshness & Failure Behavior
- **Stale windows**: the cache serves the previous value until TTL expiry — readers trade freshness for latency. Write-through (the companion pattern) closes that window by updating cache and DB together on writes.
- **Negative caching**: cache "not found" results too (short TTL) or every probe for a nonexistent key hammers the database.
- **Origin outage**: the cache should keep serving stale entries past expiry where the domain allows (`stale-while-revalidate` semantics) instead of hard-failing.
- **Thundering herd on expiry**: one hot key expiring triggers a single fetch in read-through (the cache middleware serializes the load), which is a real advantage over naive cache-aside where every application instance re-fetches independently.

### When to Choose Read-Through
| Situation | Fit |
| :--- | :--- |
| Many services read the same reference data (catalogs, configs, feature flags) | Strong — consistent loading logic lives in one place. |
| Application needs per-call transformations before caching | Weak — cache-aside lets each caller shape its own data. |
| Cache must be swapped or rebuilt without app changes | Strong — the provider abstraction isolates the datastore. |
| Small team, plain Redis client, no middleware budget | Weak — cache-aside is the pragmatic default. |

### Key takeaway

Read-Through caching simplifies application code by delegating database fetching to the cache layer. It ensures consistent loading mechanics, but requires cache infrastructure that supports underlying database integration.
