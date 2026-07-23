# Cache Stampede

> **Category:** Caching

---

Cache stampede (thundering herd / dogpile) = **many concurrent requests miss the cache and
all hit the DB at once**, when a popular cache entry expires.

### What happens
```
1. Cache entry "popular_user" expires.
2. 1000 requests arrive simultaneously.
3. All miss the cache.
4. All query the DB.
5. DB gets 1000x normal load → maybe crashes.
6. Eventually all fill the cache, but the damage is done.
```

### Solutions

#### 1. Locking
- First miss acquires a lock; others wait.
- Lock holder queries DB, fills cache, releases lock.
- Waiters now hit the cache.
```
read(key):
    val = cache.get(key)
    if val: return val
    with lock(key):
        val = cache.get(key)   # double-check
        if val: return val
        val = db.query(key)
        cache.set(key, val)
    return val
```

#### 2. Probabilistic early expiration
- Add jitter: each request randomly decides to refresh early (before TTL).
- Spreads the stampede out.

#### 3. Refresh-ahead
- Background job refreshes hot entries before TTL.
- Cache never expires for hot keys.

#### 4. Warm-up
- Pre-populate cache on deploy.

#### 5. Request coalescing
- LB / gateway merges identical concurrent misses into one DB call.

### Real-world
- Reddit, Twitter: this happens on celebrity posts.
- Netflix: recommendation cache.
- Mitigated via locks + jitter.

### Key takeaway
Cache stampede is a real production killer. Always add **locking + double-check** on cache
misses for hot keys. Probabilistic early expiration spreads the thundering herd. Pre-warm caches
after deploys.
