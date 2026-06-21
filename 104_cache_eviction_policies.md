# Cache Eviction Policies

> **Category:** Caching

---

Eviction policies decide **which entries to remove when the cache is full**.

### The main policies
| Policy | Evicts | Best for |
|--------|--------|----------|
| **LRU** (Least Recently Used) | Oldest unused | Most access patterns |
| **LFU** (Least Frequently Used) | Least accessed | Skewed access (some hot, some cold) |
| **FIFO** (First In First Out) | Oldest inserted | Simple, ordered data |
| **MRU** (Most Recently Used) | Newest | Reverse-sequential scans |
| **TTL** | By expiry time | Time-sensitive data |
| **Random** | Random | Simple, surprisingly OK |

### LRU (most common)
- Track access time per entry.
- When full, evict the entry with oldest access time.
- Doubly linked list + hash map: O(1) get/put.

```python
from functools import lru_cache

@lru_cache(maxsize=1024)
def expensive(x):
    return ...
```

### LFU
- Track access count per entry.
- Evict the entry with lowest count.
- Better for stable popularity (a few super-hot keys).
- Worse for scans (every entry briefly popular).

### ARC, W-TinyLFU (advanced)
- Hybrid policies used by Caffeine, Eclipse.
- Best of LRU + LFU.

### TTL
- Each entry has expiry time.
- Evicted when expired.
- Often combined with LRU.

### Redis eviction
- `maxmemory` policy: `noeviction`, `allkeys-lru`, `volatile-lru`, `allkeys-lfu`,
  `volatile-lfu`, `allkeys-random`, etc.

### Choosing
| Workload | Policy |
|----------|--------|
| General-purpose | LRU |
| Stable popularity | LFU |
| Time-sensitive | TTL |
| Bounded scans | MRU |
| Don't care | Random |

### Key takeaway
LRU is the safe default for most caches. LFU is better when access is heavily skewed. TTL is
mandatory for time-sensitive data. Set a `maxmemory` + eviction policy on Redis so it degrades
gracefully under memory pressure.
