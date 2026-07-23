# Distributed Consensus

> **Category:** Distributed Systems

---

Consensus = **multiple nodes agreeing on a single value / decision** despite failures.
Foundation of every consistent distributed system.

### Why
- "Who is the leader?" — leader election.
- "What's the next log entry?" — replicated state machines.
- "Is this lock held?" — distributed locks.
- "Did this transaction commit?" — atomic commit.

### The impossibility
**FLP impossibility result**: in an asynchronous network (no time bounds) with even one faulty
node, no algorithm can guarantee consensus.

In practice, we add **partial synchrony** (timeouts) and accept some liveness trade-offs.

### Algorithms

#### Paxos (Lamport, 1998)
- The classic. Hard to understand, harder to implement.
- Multi-Paxos for log replication.

#### Raft (2014)
- "Understandable Paxos."
- Leader-based; leader replicates log to followers.
- Used by etcd, Consul, CockroachDB, Kubernetes.

#### ZAB (Zookeeper Atomic Broadcast)
- Zookeeper's consensus protocol.
- Similar to Raft.

#### PBFT (Practical Byzantine Fault Tolerance)
- Tolerates Byzantine (malicious) failures.
- Used in blockchain.

### Raft in 30 seconds
```
1. Nodes start as followers.
2. One node times out, becomes candidate, requests votes.
3. Wins majority → becomes leader.
4. Leader receives writes, replicates to followers.
5. Once majority ACKs, commit.
6. If leader dies, new election.
```

### Quorum
- Cluster of 2n+1 nodes tolerates n failures.
- 3 nodes → tolerate 1 failure.
- 5 nodes → tolerate 2.
- 7 nodes → tolerate 3.

### Trade-offs
- ✅ Strong consistency.
- ✅ Survives minority failures.
- ❌ Latency: each write needs quorum round trip.
- ❌ Throughput: limited by leader.
- ❌ Network partitions: lose availability in worst case.

### Key takeaway
Consensus lets nodes agree despite failures. **Raft** is the modern standard (etcd, Consul,
Kubernetes). Pick cluster size for fault tolerance (3 or 5). Each write needs a quorum
round-trip — plan for that latency.
