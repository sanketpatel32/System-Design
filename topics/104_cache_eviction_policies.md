# Cache Eviction Policies

> **Category:** Caching

---

A **Cache Eviction Policy** determines which item to remove from a cache when it reaches its memory capacity limit and needs space for new entries. Selecting the appropriate eviction policy optimizes cache hit ratios for specific workload access patterns.

### Memory pressure eviction flow

```
                     +-----------------------------------+
                     |   New Write Request (Memory Full) |
                     +-----------------------------------+
                                       |
                                       v
                     +-----------------------------------+
                     |    Execute Eviction Algorithm     |
                     +-----------------------------------+
                                  /         \
           LRU Policy:           /           \ LFU Policy:
          Remove least          v             v Remove lowest
          recently accessed                   access frequency
                     +-----------------+   +------------------+
                     | Evict Key: "B"  |   | Evict Key: "Z"   |
                     +-----------------+   +------------------+
                                       |
                                       v
                     +-----------------------------------+
                     | Insert New Key into Freed Memory  |
                     +-----------------------------------+
```

### Primary eviction algorithms

1. **LRU (Least Recently Used)**: Evicts the item that has not been accessed for the longest time.
2. **LFU (Least Frequently Used)**: Evicts the item with the lowest total access count.
3. **FIFO (First-In, First-Out)**: Evicts the oldest cached item regardless of access frequency or recency.
4. **Random Replacement**: Selects a random item to evict. Low CPU overhead, but suboptimal hit ratios.
5. **TTL-Based (Volatile-LRU)**: Evicts the item closest to expiration among keys with a configured TTL.

### Eviction Policy Matrix

| Policy | Primary Metric | Pros | Cons / Drawbacks |
| :--- | :--- | :--- | :--- |
| **LRU** | Access Recency | Excellent general-purpose policy | Susceptible to scan pollution (one-time scans clear hot items) |
| **LFU** | Access Frequency | Retains high-frequency hot items | Retains stale historical items that are no longer accessed |
| **FIFO** | Insertion Order | Extremely low CPU/Memory overhead | Ignores item access patterns entirely |
| **Random**| Random Selection | Minimal CPU overhead | Suboptimal cache hit ratios |

### Key takeaway

Cache eviction policies manage memory limits by removing less valuable items. Use LRU for general web applications, LFU for frequency-skewed access patterns, and pair policies with TTLs to keep data fresh.
