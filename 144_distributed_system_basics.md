# Distributed System Basics

> **Category:** Distributed Systems

---

A distributed system = **multiple computers cooperating over a network to appear as one
service.** They share state, coordinate, and tolerate failures.

### Why distributed
- **Scale**: one machine can't handle the load.
- **Fault tolerance**: lose a machine, keep running.
- **Geo-distribution**: serve users globally.
- **Cost**: many commodity machines beat one supercomputer.

### Fundamental challenges
1. **Network is unreliable** — packets drop, delay, reorder.
2. **Clocks are unreliable** — clock skew between machines.
3. **Failures are normal** — nodes crash, restart, partition.
4. **Concurrency is hard** — multiple nodes race.
5. **State is spread** — coordination needed.

### The 8 Fallacies of Distributed Computing
1. The network is reliable.
2. Latency is zero.
3. Bandwidth is infinite.
4. The network is secure.
5. Topology doesn't change.
6. There is one administrator.
7. Transport cost is zero.
8. The network is homogeneous.

All false. Design assuming they're false.

### Core primitives
- **Replication**: copies of data across nodes.
- **Consensus**: agreeing on a value (Raft, Paxos).
- **Quorum**: majority agreement.
- **Leadership**: one node coordinates writes.
- **Gossip**: epidemic-style info spreading.
- **Vector clocks**: ordering events without central clock.
- **CAP / PACELC**: the consistency-availability trade-offs.

### Common patterns
- **Leader-follower**: one writer, N readers.
- **Peer-to-peer**: all nodes equal.
- **Sharding**: partition data.
- **Consistent hashing**: even distribution.
- **Quorum reads/writes**: tolerate minority failures.
- **Two-phase commit**: cross-node atomicity.
- **Saga**: long-running distributed transactions.

### Key takeaway
Distributed systems exist to **scale and tolerate failures**. The fundamental challenges are
unreliable networks, clock skew, partial failures, and concurrency. Master CAP, consensus,
quorum, replication — they're the foundation of everything.
