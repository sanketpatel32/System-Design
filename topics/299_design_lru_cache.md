# Design LRU Cache

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Least Recently Used (LRU) Cache delivering O(1) constant time complexity for both `get(key)` and `put(key, value)` operations.

### Data Structure Mechanics
Achieving O(1) time complexity requires combining two data structures:
1. **Hash Map**: Provides O(1) key lookup to Node pointer mapping.
2. **Doubly Linked List**: Provides O(1) node insertion at Head (MRU) and node removal from Tail (LRU).

### LRU Cache Memory Layout
```
                          [ Hash Map: Key -> Node* ]
                                      |
                                      v
  [ HEAD (MRU) ] <---> [ Node 1 ] <---> [ Node 2 ] <---> [ TAIL (LRU) ]
  (Most Recent)                                          (Evicts First)
```

### Operation Execution Algorithms
| Operation | Execution Steps | Complexity |
|---|---|---|
| `get(key)` | Lookup key in Hash Map → Move target node to Head of Doubly Linked List → Return value. | O(1) |
| `put(key, val)`| If key exists: update value & move node to Head.<br>If key new: create Node at Head.<br>If capacity exceeded: evict Node at Tail & remove from Hash Map. | O(1) |

### Core Schema & Data Structures
```cpp
struct Node {
    int key;
    int value;
    Node* prev;
    Node* next;
};
```

### Thread-Safe Variants
- **Coarse locking**: one `mutex` around `get`/`put` — correct and trivially simple; serializes all traffic, fine for a single-threaded interview ask.
- **Fine-grained locking**: shard the cache by `hash(key) % N` into independent LRU shards, each with its own lock — near-linear throughput scaling on multi-core servers (the approach Redis-adjacent systems and `ConcurrentLinkedHashMap` use).
- **Lock-free reads**: keep list mutations behind hand-over-hand locking or accept amortized lazy deletion — real implementations often trade strict LRU order under contention for availability.

### Eviction Semantics Worth Knowing
| Variant | Evicts | Better When |
|---|---|---|
| **LRU** | Least recently *used* | Locality of reference over time (default choice). |
| **LFU** | Least *frequently* used | Rare cold keys poisoning the cache (scans). |
| **LRU-K / ARC** | K-th-to-last access / adaptive blend | Access patterns alternate between hot and one-shot keys. |
| **TTL + LRU** | Expired first, then LRU | Freshness matters as much as capacity. |

A classic LRU weakness: a single bulk scan (nightly backup reading every key) flushes the entire hot set; ARC-style algorithms detect and absorb scans.

### Practical Notes
- **Capacity accounting**: real caches bound *bytes*, not entry counts — value serializers plus per-node pointer overhead (~48–64 bytes) count toward the budget.
- **Get-with-loader**: production caches pair `get(key, loader)` so a miss transparently computes and inserts, collapsing the check-then-set race into one atomic step.
- **Java shortcut**: `LinkedHashMap` with `accessOrder=true` and `removeEldestEntry()` overridden is a ~10-line LRU — mention it, then build the hashmap + list version to prove you understand the mechanics.

### Key takeaway
An LRU Cache combines a Hash Map for O(1) key lookups with a Doubly Linked List for O(1) node movement, maintaining Most Recently Used items at the head and evicting from the tail.
