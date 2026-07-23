# Quorum

> **Category:** Distributed Systems

---

Quorum = **the minimum number of nodes that must agree** for a decision to be valid. Lets
systems tolerate minority failures.

### The math
For a cluster of **N** nodes, the majority quorum is:
```
W = floor(N/2) + 1     # writes need this many ACKs
R = floor(N/2) + 1     # reads need this many responses
```
With N=3: quorum = 2. Tolerates 1 failure.
With N=5: quorum = 3. Tolerates 2 failures.

### Why quorum works
- Any two majorities **must overlap** (pigeonhole).
- So a read quorum and the latest write quorum share at least one node.
- That shared node has the latest value.

### Read/write quorum trade-offs
```
R + W > N  -> strong consistency
R + W <= N -> eventual consistency
```
Common configs:
| R | W | Property |
|---|---|----------|
| N | 1 | Fast writes, slow reads |
| 1 | N | Fast reads, slow writes |
| majority | majority | Balanced, fault-tolerant |
| 1 | 1 (with N replicas) | Eventual, fastest |

### DynamoDB / Cassandra
- Configurable consistency per request.
- `consistency=ONE` (fastest), `QUORUM` (strong), `ALL` (slowest).

### Why you want odd N
- 3 nodes tolerate 1 failure (33%).
- 4 nodes also tolerate 1 failure (25%) — wasted.
- 5 nodes tolerate 2 failures (40%).
- 7 nodes tolerate 3 (43%).
- Always pick **odd** cluster sizes.

### Fencing and quorum
- Quorum alone doesn't prevent split-brain from a confused old leader.
- Combine with **fencing tokens** for safety.

### Key takeaway
Quorum lets a cluster tolerate minority failures. Use **odd cluster sizes** (3 or 5). Set
`R + W > N` for strong consistency. Quorum alone isn't enough — combine with fencing for split-
brain safety.
