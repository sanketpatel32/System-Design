# Vector Clocks

> **Category:** Distributed Systems

---

Vector clocks = **a way to order events across nodes without a central clock**. Detects
concurrency and causality.

### The problem
- Each node has its own clock, possibly skewed.
- Can't trust physical timestamps for ordering.
- Need to know: did event A happen before B? Or were they concurrent?

### Vector clock structure
- Each node maintains a vector `[n1, n2, n3, ...]` of counters.
- On local event: increment own counter.
- On send: attach current vector.
- On receive: max each element with received vector, then increment own.

### Example
```
Node A: [0,0,0] -> local event -> [1,0,0]
       sends to B with [1,0,0]
Node B: [0,0,0] -> receives [1,0,0] -> max([0,0,0],[1,0,0]) + inc B -> [1,1,0]
```

### Comparison rules
Given two vector clocks V1 and V2:
- **V1 < V2** (V1 happened before V2): every V1[i] <= V2[i], with at least one strict.
- **V1 > V2**: vice versa.
- **Concurrent**: neither dominates (some elements larger, some smaller).

### Use cases
- **DynamoDB, Riak**: detect conflicting writes.
- **CRDTs**: determine merge order.
- **Distributed debugging**: causal history.

### Conflict detection
```
Client A writes x=1 with clock [1,0]
Client B writes x=2 with clock [0,1]
Server compares: neither dominates → CONFLICT
```
App resolves (last-write-wins, prompt user, merge).

### Vector clocks vs version vectors
- Similar; version vectors track per-replica versions of an object.
- Vector clocks track per-event ordering.

### Trade-offs
- ✅ Detects causality without central clock.
- ❌ Size grows with node count (O(N)).
- ❌ Comparison is O(N).
- Dotted version vectors, interval tree clocks: more compact variants.

### Key takeaway
Vector clocks let nodes determine **causality** (did A cause B? are they concurrent?) without a
central clock. Used by DynamoDB, Riak for conflict detection. Trade-off: O(N) size per clock.
