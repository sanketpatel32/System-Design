# Design CDN

> **Category:** Advanced System Design Problems

---

Design a CDN: globally distributed cache.

### Requirements
- **Functional**: cache content at edge; serve from edge on hit.
- **Non-functional**: low-latency; high-throughput; HA.

### Architecture
```
[User] -> [Edge PoP] (cache HIT) -> return
              |
              v (MISS)
          [Origin]
              |
              v
          [Edge caches response] -> return
```

### Edge PoPs
- Hundreds of locations globally.
- Each PoP has cache (RAM + SSD).
- Anycast routes user to nearest.

### Caching
- Per-URL cache.
- TTL from origin headers.
- Eviction: LRU when full.

### Purge
- URL-specific.
- Surrogate keys (group of URLs).
- Global purge.

### Origin shield
- Intermediate cache between edges and origin.
- Multiple edges miss → shield absorbs.
- Reduces origin load.

### Dynamic content
- Pass through (no cache).
- Or short TTL.

### Video streaming
- HLS segment caching.
- Pre-warm for popular videos.

### Key takeaway
CDN = globally distributed edge caches + anycast routing + TTL/purge invalidation + origin
shield. Cache static indefinitely (versioned URLs); dynamic via short TTL or pass-through.
