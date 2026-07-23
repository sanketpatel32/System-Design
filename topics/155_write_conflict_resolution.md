# Write Conflict Resolution

> **Category:** Distributed Systems

---

Write conflicts = **two replicas accepted writes for the same key concurrently**, then need
to merge.

### When it happens
- Multi-master / leaderless setups (DynamoDB, Cassandra).
- Network partition splits writers.
- Offline edits syncing later.

### Resolution strategies

#### 1. Last-Write-Wins (LWW)
- Use timestamp; newest wins.
- Simple, lossy (one write discarded).
- Vulnerable to clock skew.

#### 2. Vector clocks + app resolution
- System detects conflict.
- Returns both versions to app.
- App decides (e.g. merge fields, prompt user).

#### 3. CRDTs (Conflict-free Replicated Data Types)
- Data structures that always merge deterministically.
- Counters (G-Counter, PN-Counter), sets (OR-Set), maps.
- Used in Riak, Yjs, Automerge.

#### 4. Application logic
- Custom merge function per data type.
- E.g. shopping cart: union of items.

#### 5. Version vectors + dotted
- More precise than vector clocks; smaller.

### LWW in practice
```
A writes x=1 at t=10.
B writes x=2 at t=11.
LWW: x=2 wins.
But if A's clock was ahead: A writes at t=15 (wrongly).
Result: x=1 wins, even though it's older.
```
Clock skew breaks LWW.

### CRDT example (PN-Counter)
- Each node tracks increments and decrements separately.
- Merge: take element-wise max of increment vectors and decrement vectors.
- Always converges, no conflict.

### When to use which
| Pattern | Resolution |
|---------|------------|
| Eventual, simple | LWW |
| Application-aware | Vector clocks + app merge |
| Always-merge | CRDTs |
| Strong consistency | Single leader, no conflicts |

### Key takeaway
Conflicts arise in multi-master / leaderless systems. Choose resolution by use case: **LWW** for
simple, **CRDTs** for automatic merge, **app merge** when you know the semantics. Avoid conflicts
altogether with single-leader when possible.
