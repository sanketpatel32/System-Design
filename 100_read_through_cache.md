# Read Through Cache

> **Category:** Caching

---

Read-through = **the cache library/layer is responsible for fetching from the DB on miss**.
The app just calls `cache.get(key)`.

### Flow
```
value = cache.get_or_fetch(key, lambda k: db.query(k))
# Internally:
#   if cache hit: return
#   else: call lambda, fill cache, return
```

### Difference from cache-aside
| | Cache-aside | Read-through |
|--|-------------|--------------|
| Who fetches? | Application | Cache library |
| Code | App has DB+cache logic | Cache abstracts DB |
| Read path | 2 calls (cache then DB) | 1 call |

### Pros
- ✅ **Cleaner app code** — caching is transparent.
- ✅ **Consistent TTL/eviction** — library enforces.
- ✅ Less duplication across services.

### Cons
- ❌ **Cache library coupling** — must know how to fetch.
- ❌ Harder to debug (where did the data come from?).
- ❌ Same stampede risk as cache-aside (unless library handles it).

### Implementations
- **Spring Cache, Hibernate L2 cache** (Java).
- **Caffeine + loading function** (JVM).
- **Redis with Lua + loader** (custom).

### When to use
- Many call sites for the same cached entity.
- Need consistent TTL / refresh policies.
- Want a clean abstraction.

### When NOT to use
- Heterogeneous data sources.
- Complex fetch logic.
- Tight latency requirements (abstraction adds overhead).

### Key takeaway
Read-through hides cache+DB logic behind a single API, keeping app code clean. Best when many
call sites share the same data and fetch logic. Cache-aside is more flexible when fetch logic
varies.
