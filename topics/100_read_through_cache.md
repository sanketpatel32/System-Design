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

### Key takeaway

Read-Through caching simplifies application code by delegating database fetching to the cache layer. It ensures consistent loading mechanics, but requires cache infrastructure that supports underlying database integration.
