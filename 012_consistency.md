# Consistency

> **Category:** System Design Basics

---

Consistency = **the guarantee about the visibility and order of writes.** It spans a spectrum
from "every read sees every write" to "eventually you'll see it".

### The spectrum
```
Strong     < Sequential < Causal < Eventual
  |              |           |          |
latest always   ordered    cause/effect  maybe stale
```

- **Strong**: read always returns the latest write. High latency, low availability under
  partitions.
- **Sequential**: all clients see writes in the same order.
- **Causal**: causally-related writes are ordered; concurrent ones can vary.
- **Eventual**: given no new writes, all replicas converge — eventually. Fast, available.

### Where each fits
| Use case | Consistency |
|----------|-------------|
| Banking, ledger | Strong |
| Timeline / feed | Causal |
| Cart, inventory | Strong-ish (with locks) |
| Like count, view count | Eventual |
| DNS, search index | Eventual |

### Consistency in distributed DBs
- **Linearizability**: strongest single-object.
- **Serializability**: strongest multi-transaction.
- **Read-your-writes**: a user always sees their own writes (session consistency).

### Achieving consistency
- **Quorum reads/writes** (R + W > N).
- **Consensus protocols** (Raft, Paxos) for linearizable writes.
- **Versioning** (vector clocks) for conflict detection.
- **Read repair** and anti-entropy to converge replicas.

### Key takeaway
Pick the **weakest** consistency that satisfies the business rule. Stronger than needed = wasted
latency and availability.
