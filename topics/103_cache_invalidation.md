# Cache Invalidation

> **Category:** Caching

---

Cache invalidation = **ensuring cached data matches the source of truth.** The famous quote:
> "There are only two hard things in CS: cache invalidation and naming things."

### Approaches

#### 1. TTL (time-to-live)
- Cache entry expires after N seconds.
- Simple, but allows stale data for up to TTL.
- Good for data that changes rarely.

#### 2. Explicit invalidation
- App deletes/updates cache entry when source changes.
- Stronger consistency.
- Requires app to know when to invalidate.

#### 3. Event-driven invalidation
- DB change → event (CDC) → invalidator → cache delete.
- Decouples app from cache logic.
- Used by Debezium + Redis.

#### 4. Versioned keys
- Cache key includes version: `user:123:v5`.
- Bump version on update → new cache entry.
- Old entries expire via TTL.
- Avoids invalidation races.

### Common bugs
- **Stale reads**: cache updated before DB commit, then DB rolls back.
- **Race conditions**: concurrent update + read fills cache with stale data.
- **Forgotten invalidations**: app updates DB but not cache.

### Safe write patterns
```
# Cache-aside safe pattern:
db.update(key, value)
cache.delete(key)   # delete, not update
```
- Delete avoids races where a stale read fills cache after the update.
- Next read misses, fetches fresh from DB, fills.

### Multi-layer invalidation
Browser → CDN → app cache → Redis → DB.
Invalidate through all layers (CDN purge, Redis delete, app cache eviction).

### Key takeaway
Invalidation is hard. Prefer **TTL + delete-on-write** for most cases. For high consistency,
use **event-driven invalidation (CDC)**. Version keys for change-heavy data. Always test for
race conditions.
