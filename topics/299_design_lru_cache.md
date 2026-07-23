# Design LRU Cache

> **Category:** Low Level Design

---

LLD: implement LRU cache (also see #105 caching / LRU).

### Requirements
- get(key), put(key, value) in O(1).
- Capacity-bound, evict LRU.

### Data structures
- **HashMap**: key → node (O(1) lookup).
- **Doubly linked list**: ordered by recency (O(1) move/evict).

### Implementation
```python
class Node:
    key, value
    prev, next

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}  # key -> Node
        # dummy head/tail for clean list ops
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._move_to_front(node)
            return node.value
        return -1

    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_front(node)
        else:
            node = Node(key, value)
            self.cache[key] = node
            self._add_front(node)
            if len(self.cache) > self.cap:
                lru = self.tail.prev
                self._remove(lru)
                del self.cache[lru.key]

    # helper methods: _add_front, _remove, _move_to_front
```

### Key takeaway
LRU LLD = HashMap (O(1) lookup) + doubly linked list (O(1) reorder). Dummy head/tail nodes
eliminate edge cases. Move to front on access, evict tail when full.
