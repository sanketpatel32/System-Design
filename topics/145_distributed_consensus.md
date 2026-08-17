# Distributed Consensus

> **Category:** Distributed Systems

---

Distributed consensus is the fundamental problem of getting **multiple independent, potentially fault-prone nodes to agree on a single data value or state transition** over an unreliable network. Consensus guarantees state machine replication and data consistency across distributed clusters.

### Consensus Protocol Architecture (Leader-Follower State Machine)

Consensus algorithms (such as Raft or Paxos) elect a single Leader node responsible for managing a replicated log across Follower nodes.

```
+----------------------------------------------------------------------------------------------------+
|                                         Client Application                                         |
+----------------------------------------------------------------------------------------------------+
                                                   |
                                       Write Request (`SET x = 10`)
                                                   v
+----------------------------------+   1. Append Log Entry   +----------------------------------+
|  Leader Node (Raft Term 1)       | ----------------------> |  Follower Node A                 |
|  - Appends Entry to Local Log    | <---------------------- |  - Replicates Entry to Log       |
|  - Waits for Majority Quorum ACK |   2. ACK Replicated     +----------------------------------+
+----------------------------------+                             |
                 |                                               v
                 | 1. Append Log Entry                       +----------------------------------+
                 +-----------------------------------------> |  Follower Node B                 |
                 <------------------------------------------ |  - Replicates Entry to Log       |
                   2. ACK Replicated                         +----------------------------------+
                 |
                 v 3. Majority Replicated (2 of 3) -> Commit Entry!
+----------------------------------------------------------------------------------------------------+
|  Leader applies state transition and responds `Success` back to Client                              |
+----------------------------------------------------------------------------------------------------+
```

### Major Consensus Algorithms Comparison Matrix

| Algorithm | Fault Tolerance Model | Key Characteristic | Common Production Implementations |
| :--- | :--- | :--- | :--- |
| **Paxos** | Crash-Stop / Crash-Recovery | Formal mathematical consensus foundation; complex to implement | Google Chubby, Spanner |
| **Raft** | Crash-Stop / Crash-Recovery | Decomposed into Leader Election, Log Replication, Safety | etcd, HashiCorp Consul, CockroachDB |
| **Zab** | Crash-Stop / Crash-Recovery | Primary-backup atomic broadcast protocol designed for tree state | Apache ZooKeeper |
| **PBFT** | Byzantine (Malicious Nodes) | Tolerates arbitrary or malicious node failures (Requires 3f+1 nodes) | Blockchain, Hyperledger |

### Core Consensus Rules (Raft Framework)

1. **Leader Election**: A node becomes Candidate if heartbeat times out. Obtains votes from a majority of cluster nodes to become Leader.
2. **Log Replication**: The Leader accepts client commands, appends them to its log, and forces Followers to replicate its log entries in identical order.
3. **Safety Guarantee**: If a server has applied a log entry at a given index to its state machine, no other server will ever apply a different log entry for that index.

### Trade-offs & Performance Constraints

- ✅ **Strong Consistency & High Availability**: System continues operating correctly as long as a majority of nodes (⌊N/2⌋ + 1) remain operational.
- ❌ **Write Latency Penalty**: Every write operation requires network round trips to achieve majority quorum consensus.
- ❌ **Throughput Limitation**: Consensus throughput is bounded by single-leader network and disk log flush speeds.

### Key takeaway

Distributed consensus guarantees **replicated state machine consistency across node failures** through majority quorum voting and ordered log replication (Raft/Paxos).
