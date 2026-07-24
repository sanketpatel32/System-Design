# Vector Clocks

> **Category:** Distributed Systems

---

A Vector Clock is an algorithm used to **generate logical timestamps and establish causal ordering of events** across distributed nodes without relying on synchronized physical clocks.

### Vector Clock State Update Mechanism

```
  Node A: [A:1, B:0] ------------ Local Write ------------> [A:2, B:0] (Concurrent Conflict!)
             \                                                    /
              \ Network Sync                                     /
               v                                                v
  Node B: [A:1, B:0] ---- Local Write ----> [A:1, B:1] -- Client Reconciles --> [A:2, B:1]
```

### Vector Clock Rules

Each node maintains an array (vector) of size \(N\) representing its knowledge of logical clock state across all cluster nodes:

1. **Local Operation**: Before a node \(i\) processes an event, it increments its own component: `V[i] = V[i] + 1`.
2. **Message Send**: Node \(i\) attaches its current vector clock `V` to outgoing network messages.
3. **Message Receive**: Upon receiving message with clock `V_msg`, node \(i\) updates vector: `V[j] = max(V[j], V_msg[j])` for all \(j\), then increments `V[i] = V[i] + 1`.

### Event Causality Comparison Matrix

| Scenario | Clock Condition | Relationship | Interpretation |
| :--- | :--- | :--- | :--- |
| **Event X Causal Precedes Y** | \(V(X) < V(Y)\) | \(X 	o Y\) | Event X happened before Y; state safely overwritten. |
| **Event Y Causal Precedes X** | \(V(Y) < V(X)\) | \(Y 	o X\) | Event Y happened before X; state safely overwritten. |
| **Concurrent Writes** | Neither \(V(X) \le V(Y)\) nor \(V(Y) \le V(X)\) | \(X \parallel Y\) | Conflict detected! Client/App must resolve divergence. |

### System Trade-offs

- ✅ **Causal Accuracy**: Detects concurrent updates reliably without physical clock synchronization errors.
- ❌ **Vector Size Explosion**: Vectors grow proportionally to the number of nodes (\(O(N)\)). Mitigated using actor pruning or limit bounds (e.g. Amazon Dynamo).

### Key takeaway

Vector clocks establish **causal ordering between distributed events**, identifying concurrent write conflicts without relying on physical clock synchronization.
