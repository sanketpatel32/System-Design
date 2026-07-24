# Design LRU Cache

> **Category:** Low Level Design

---

Object-Oriented Low-Level Design (LLD) for a Least Recently Used (LRU) Cache delivering $O(1)$ constant time complexity for both `get(key)` and `put(key, value)` operations.

### Data Structure Mechanics
Achieving $O(1)$ time complexity requires combining two data structures:
1. **Hash Map**: Provides $O(1)$ key lookup to Node pointer mapping.
2. **Doubly Linked List**: Provides $O(1)$ node insertion at Head (MRU) and node removal from Tail (LRU).

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
| `get(key)` | Lookup key in Hash Map $ightarrow$ Move target node to Head of Doubly Linked List $ightarrow$ Return value. | $O(1)$ |
| `put(key, val)`| If key exists: update value & move node to Head.<br>If key new: create Node at Head.<br>If capacity exceeded: evict Node at Tail & remove from Hash Map. | $O(1)$ |

### Core Schema & Data Structures
```cpp
struct Node {
    int key;
    int value;
    Node* prev;
    Node* next;
};
```

### Key takeaway
An LRU Cache combines a Hash Map for $O(1)$ key lookups with a Doubly Linked List for $O(1)$ node movement, maintaining Most Recently Used items at the head and evicting from the tail.
