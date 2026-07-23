# LRU Cache

> **Category:** Caching

---

LRU (Least Recently Used) cache evicts the **least recently accessed** entry when full. The
most common eviction policy.

### Why LRU
- **Locality of reference**: recently-accessed data is likely to be accessed again soon.
- Simple, predictable, fast (O(1) operations).

### Data structure
- **Hash map**: key → node (O(1) lookup).
- **Doubly linked list**: ordered by recency (O(1) move-to-front + remove-from-tail).

```
hash: {key: node}
list: [most recent] <-> ... <-> [least recent]
```

### Operations
```
get(key):
    if key in hash:
        move node to front of list
        return node.value
    return None

put(key, value):
    if key in hash:
        update node, move to front
    else:
        if full: evict tail (LRU)
        create node, prepend to list
```

### In Python
```python
from functools import lru_cache

@lru_cache(maxsize=1024)
def fetch_user(user_id):
    return db.get(user_id)
```
Or `collections.OrderedDict`:
```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.od = OrderedDict()
    def get(self, key):
        if key not in self.od:
            return None
        self.od.move_to_end(key)
        return self.od[key]
    def put(self, key, value):
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)  # evict LRU
```

### When LRU is suboptimal
- **Scan workloads**: a full scan flushes the cache (every entry becomes "recent" briefly).
- **Stable popularity**: LFU may do better.
- **Periodic access**: ARC, W-TinyLFU adapt.

### Real-world
- Redis `allkeys-lru`.
- Memcached LRU.
- Postgres buffer pool uses Clock (LRU approximation).
- Browser disk cache.

### Key takeaway
LRU is the default eviction policy. O(1) get/put via hash map + doubly linked list. In Python,
`functools.lru_cache` or `OrderedDict`. Use LFU or hybrid (W-TinyLFU) only if access patterns
make LRU poor.
