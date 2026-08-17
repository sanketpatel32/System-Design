# Vector Clocks

> **Category:** Distributed Systems

---

A vector clock is an algorithm for **generating a partial ordering of events and detecting causality violations (write conflicts)** in a distributed system without relying on synchronized physical clocks. It maintains a vector of logical clock counters across all participating nodes.

### Vector Clock Mechanics & Causality Flow

Each node maintains an array (vector) V of size N (where N is the number of nodes). Vᵢ[j] represents node i's knowledge of the logical clock value at node j.

```
Node A                       Node B                       Node C
V_A = [0,0,0]                V_B = [0,0,0]                V_C = [0,0,0]
  |                            |                            |
  | Event (Write)              |                            |
  | V_A = [1,0,0]              |                            |
  |                            |                            |
  |--- Send (Msg + [1,0,0]) -->|                            |
  |                            | Receive: Merge max()       |
  |                            | V_B = [1,1,0]              |
  |                            |                            |
  |                            |--- Send (Msg + [1,1,0]) -->|
  |                            |                            | Receive: Merge max()
  |                            |                            | V_C = [1,1,1]
```

### Comparing Vector Clock States

Given two vector clock states V₁ and V₂:
- **Causal Antecedent (V₁ happened before V₂)**: V₁ ≤ V₂ if every element V₁[i] ≤ V₂[i] and at least one element V₁[j] < V₂[j].
- **Concurrent / Conflict (V₁ \parallel V₂)**: If neither V₁ ≤ V₂ nor V₂ ≤ V₁ is true, the operations occurred concurrently and represent a **Write Conflict** requiring application resolution.

### Vector Clock Comparison Matrix

| Scenario | Vector State 1 (V₁) | Vector State 2 (V₂) | Relationship | Action Taken |
| :--- | :--- | :--- | :--- | :--- |
| **Causal Succession** | `[A:1, B:0]` | `[A:1, B:1]` | V₁ < V₂ (V₂ supersedes V₁) | Overwrite V₁ with V₂ automatically |
| **Concurrent Conflict** | `[A:2, B:1]` | `[A:1, B:2]` | V₁ \parallel V₂ (Concurrent updates!) | Trigger Conflict Resolution (Sibling Merge) |
| **Identical State** | `[A:2, B:2]` | `[A:2, B:2]` | V₁ = V₂ | No action required |

### Key Trade-offs & Production Realities

- ✅ **Independent of Physical Clocks**: Unaffected by NTP clock skew or leap seconds.
- ✅ **Accurate Conflict Detection**: Guarantees detection of concurrent updates without data loss.
- ❌ **Vector Size Inflation**: Vector clock length grows linearly with the number of writing nodes. Systems like Amazon Dynamo use **Vector Pruning (Truncation)** to cap vector size.
### Vector Clock Python Implementation Example

```python
class VectorClock:
    def __init__(self, node_id):
        self.node_id = node_id
        self.clock = {node_id: 0}

    def increment(self):
        self.clock[self.node_id] = self.clock.get(self.node_id, 0) + 1

    def merge(self, remote_clock):
        for node, count in remote_clock.items():
            self.clock[node] = max(self.clock.get(node, 0), count)
        self.increment()

    def compare(self, other_clock):
        # Returns 'LESS', 'GREATER', 'EQUAL', or 'CONCURRENT'
        self_greater = any(self.clock.get(k, 0) > other_clock.get(k, 0) for k in set(self) | set(other_clock))
        other_greater = any(other_clock.get(k, 0) > self.clock.get(k, 0) for k in set(self) | set(other_clock))
        
        if self_greater and not other_greater: return "GREATER"
        if other_greater and not self_greater: return "LESS"
        if not self_greater and not other_greater: return "EQUAL"
        return "CONCURRENT" # Write Conflict Detected!
```

### Vector Clock Pruning (Truncation)

To prevent vector clock size from growing indefinitely as node membership churns:
- **Timestamp Truncation**: Databases prune old node entries from vector clocks if they haven't been updated within a specified window (e.g. 14 days).

### Key takeaway

Vector clocks track **causal relationships between distributed events** without physical clocks, enabling systems like Riak and Dynamo to detect concurrent write conflicts reliably.
