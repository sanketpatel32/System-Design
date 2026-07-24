# LRU Cache

> **Category:** Caching

---

An **LRU (Least Recently Used) Cache** is a cache eviction structure that discards the least recently accessed items first when memory capacity is reached. It operates on the principle of temporal locality: items accessed recently are likely to be accessed again in the near future.

### Data structure architecture

```
                         HashMap (O(1) Key Lookups)
                +-------------------------------------------+
                | Key "A" -> Node(A)                        |
                | Key "B" -> Node(B)                        |
                +-------------------------------------------+
                                      |
                                      v
                      Doubly Linked List (O(1) Recency Ordering)
          +------+    <--->    +------+    <--->    +------+
  HEAD -> |  C   |             |  A   |             |  B   | <- TAIL
          | (MRU)|             |      |             | (LRU)|
          +------+    <--->    +------+    <--->    +------+
         (Most Recent)                           (Least Recent / Next to Evict)
```

### Data structure design ($O(1)$ operations)

To achieve $O(1)$ time complexity for both `get(key)` and `put(key, value)` operations, an LRU cache combines two data structures:

1. **Doubly Linked List**: Maintains item access ordering. The head represents the **Most Recently Used (MRU)** item, while the tail represents the **Least Recently Used (LRU)** item.
2. **Hash Map**: Maps keys directly to doubly linked list nodes, enabling $O(1)$ node access without scanning the list.

### LRU Operations Breakdown

| Operation | Action Taken | Time Complexity |
| :--- | :--- | :--- |
| **`get(key)`** | Lookup node in HashMap. If found, move node to Head (MRU). Return value. | $O(1)$ |
| **`put(key, val)`**| If key exists, update value and move to Head. If new, insert at Head. If full, remove Tail node & erase from HashMap. | $O(1)$ |

### Approximated LRU in Redis

Standard LRU requires maintaining pointers for every entry, consuming significant memory. Redis uses an **Approximated LRU Algorithm**:
- Samples $N$ random keys (e.g., $N = 5$).
- Evicts the logical least recently used key among the sampled set.
- Delivers performance comparable to true LRU while saving significant memory.

### Key takeaway

An LRU Cache combines a Hash Map and a Doubly Linked List to provide $O(1)$ reads, writes, and evictions. Use LRU to maintain high hit ratios based on temporal access patterns.
