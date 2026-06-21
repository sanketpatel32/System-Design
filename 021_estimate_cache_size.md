# Estimate Cache Size

> **Category:** Back-of-the-Envelope Estimation

---

Cache size determines your Redis/Memcached cluster and how much of your hot data fits in
memory.

### Strategy
1. Find the **80/20** hot set — what % of requests hit a small % of data?
2. Size cache to hold that hot set, not the whole DB.

### Formula
```
cache_size = hot_items × avg_item_size
```

### Example — news feed
- Hot set = recent 3 days of posts = 1.5B posts
- Cache just metadata: 1.5B × 500B = 750 GB → too big
- Cache only **IDs + metadata** for a user's feed: 100 IDs × 200B × 100M users = 2 TB
- Cache **just the last 200 posts per active user** → much smaller

### Hit rate vs size curve
```
Hit rate
  100% |                 ___________
       |            ___/
   80% |        ___/
       |    ___/
   50% | __/
       |___________________________
         cache size (GB)
```
Diminishing returns — beyond the hot set, additional cache is wasted money.

### TTL and eviction
- **TTL** (time-to-live): expire entries proactively.
- **LRU**: evict least recently used.
- **LFU**: evict least frequently used (better for skewed access).

### Cache cost vs DB cost
- Redis: ~$0.50/GB/month (ElastiCache) → fast but expensive.
- EBS SSD: ~$0.10/GB/month → slower, cheaper.

### Key takeaway
Don't cache the whole DB. Identify the **hot 20% that drives 80% of traffic**, and size the cache
to hold that.
