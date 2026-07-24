# Write Conflict Resolution

> **Category:** Distributed Systems

---

Write conflict resolution is the process of **reconciling concurrent, contradictory updates made to the same data record** on different nodes in an eventually consistent distributed system. Because leaderless or multi-master databases accept writes asynchronously on multiple nodes, systems must employ deterministic conflict resolution strategies to achieve eventual convergence.

### Multi-Master Concurrent Write Conflict Flow

Concurrent updates occurring independently on Node A and Node B produce conflicting vector versions (`[A:1, B:0]` vs `[A:0, B:1]`) that require reconciliation.

```
                                 +-----------------------+
                                 |  Original State (v0)  |
                                 |  `cart = [item_A]`    |
                                 +-----------------------+
                                    /                         Concurrent Write on Node A /                   \ Concurrent Write on Node B
  User adds Item B                /                     \ User adds Item C
                                 v                       v
                    +-----------------------+ +-----------------------+
                    | Node A State          | | Node B State          |
                    | `cart = [item_A, B]`  | | `cart = [item_A, C]`  |
                    | Vector: [A:1, B:0]    | | Vector: [A:0, B:1]    |
                    +-----------------------+ +-----------------------+
                                 \                       /
                                  \                     /
                                   v                   v
                    +---------------------------------------------------+
                    | CONFLICT DETECTED! ([A:1, B:0] || [A:0, B:1])     |
                    | Resolution Strategy:                              |
                    | - LWW: Drop one update based on physical clock    |
                    | - Application Merge: `cart = [item_A, B, C]`      |
                    +---------------------------------------------------+
```

### Conflict Resolution Strategies Matrix

| Strategy | Mechanics | Automation | Risk / Trade-off | Used In |
| :--- | :--- | :--- | :--- | :--- |
| **Last-Write-Wins (LWW)** | Selects update with highest physical timestamp | Fully Automatic | Data Loss! (Drops updates if physical clocks drift) | Cassandra, DynamoDB |
| **Application Sibling Merge**| Retains both versions as "siblings"; forces client to resolve | Manual (Client Logic) | Increases application complexity | Riak, Amazon Shopping Cart |
| **CRDTs (Conflict-Free Replicated Data Types)**| Mathematically convergent data structures (PNCounters, LWW-Element-Set) | Fully Automatic | Bounded to specific supported data types | Redis Enterprise, Riak |
| **Multi-Version Concurrency (MVCC)**| Stores versions with monotonic sequence IDs | Semi-Automatic | Storage growth due to multiple tombstones | CouchDB |

### Conflict-Free Replicated Data Types (CRDTs)

CRDTs are specialized data structures that guarantee automatic deterministic convergence without conflict resolution code:
- **Operation-Based CRDTs**: Replicate operations (e.g. `add(5)`) over reliable channels.
- **State-Based CRDTs**: Merge full state matrices using commutative, associative, and idempotent merge operations ($	ext{Merge}(A, B) = 	ext{Merge}(B, A)$).

### Key Trade-offs & Production Design Guidance

- **Avoid LWW for Critical Business Data**: Last-Write-Wins is simple but causes silent data loss under physical clock skew.
- **Use CRDTs for Counters & Sets**: Ideal for user shopping carts, online user sets, and collaborative text editing (OT/CRDTs).
### Conflict-Free Replicated Data Type (CRDT) PN-Counter Code Example

```python
# Python State-Based Positive-Negative Counter CRDT (PN-Counter)
class PNCounter:
    def __init__(self, node_id):
        self.node_id = node_id
        self.P = {} # Increments per node
        self.N = {} # Decrements per node

    def increment(self, val=1):
        self.P[self.node_id] = self.P.get(self.node_id, 0) + val

    def decrement(self, val=1):
        self.N[self.node_id] = self.N.get(self.node_id, 0) + val

    def value(self):
        return sum(self.P.values()) - sum(self.N.values())

    def merge(self, other):
        # Commutative, Associative, Idempotent Merge Function
        all_nodes = set(self.P.keys()) | set(other.P.keys()) | set(self.N.keys()) | set(other.N.keys())
        for n in all_nodes:
            self.P[n] = max(self.P.get(n, 0), other.P.get(n, 0))
            self.N[n] = max(self.N.get(n, 0), other.N.get(n, 0))
```

### Key takeaway

Write conflict resolution reconciles concurrent multi-master updates using **Last-Write-Wins (LWW), Client-Side Sibling Merging, or Conflict-Free Replicated Data Types (CRDTs)** to guarantee eventual data convergence.
