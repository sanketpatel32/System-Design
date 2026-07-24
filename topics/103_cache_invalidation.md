# Cache Invalidation

> **Category:** Caching

---

> *"There are only two hard things in Computer Science: cache invalidation and naming things."* — Phil Karlton

**Cache Invalidation** is the process of removing or updating cached data when the underlying source of truth (the database) changes. Proper invalidation prevents systems from serving stale, inaccurate data to clients.

### Invalidation strategies architecture

```
                          [ Underlying Data Mutates ]
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
 (Time-Based TTL)           (Explicit Invalidation)           (Event-Driven CDC)
       v                               v                               v
 Cache item expires           App issues `DEL key`            Debezium / Kafka event
 after fixed duration         upon DB `UPDATE` statement      purges Redis key
```

### Invalidation strategies comparison

1. **TTL-Based Expiration**: Assigns a fixed expiration time to cached items. *Simple, but risks serving stale data until the TTL expires.*
2. **Explicit App Invalidation**: The application explicitly deletes or updates cache keys whenever a database mutation succeeds.
3. **Event-Driven Change Data Capture (CDC)**: Database transaction logs stream updates via Kafka or Debezium to background workers that purge affected cache keys.

### Cache Invalidation Matrix

| Strategy | Data Freshness | Implementation Complexity | Best Used For |
| :--- | :--- | :--- | :--- |
| **Short TTL (e.g., 60s)** | Moderate | Low (Set TTL on `SET` operation) | High-volume dynamic content where minor staleness is acceptable |
| **Explicit App Deletion** | High | Moderate (Add cache deletion to app write paths) | Transactional data (User profiles, Account settings) |
| **Event-Driven CDC** | High | High (Requires CDC pipeline) | Multi-service architectures where writes bypass the main app |
| **Write-Through Update** | Maximum | Moderate | Systems requiring strict cache-database consistency |

### Key takeaway

Cache invalidation maintains consistency between caches and underlying datastores. Combine explicit application purging for critical data with TTL safety nets to handle unexpected edge cases.
