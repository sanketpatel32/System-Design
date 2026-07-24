# Distributed Consensus

> **Category:** Distributed Systems

---

Distributed Consensus is the process of getting multiple autonomous nodes in a distributed network to **agree on a single data value, state machine input, or sequence of events**, even in the presence of node crashes or network partitions.

### Consensus Protocol Architecture (Raft Leader Log Replication)

```
+------------------+          1. Write Request (v=42)          +------------------+
| Client           | ----------------------------------------> | Leader Node      |
+------------------+                                           +------------------+
                                                                 | Append Entry
                                                                 | (Term 1, Index 5)
                                                                 v
                                         +-----------------------+-----------------------+
                                         | 2. Replicate Log (AppendEntries RPC)          |
                                         v                                               v
                             +-----------------------+                       +-----------------------+
                             | Follower Node 1       |                       | Follower Node 2       |
                             | (Appends & ACKs)      |                       | (Appends & ACKs)      |
                             +-----------------------+                       +-----------------------+
                                         |                                               |
                                         +-----------------------+-----------------------+
                                                                 | 3. Quorum Majority ACK (2 of 3)
                                                                 v
                                                     +-----------------------+
                                                     | Leader Commits & ACKs |
                                                     +-----------------------+
```

### Protocol Comparison Matrix

| Protocol | Leader Architecture | Consensus Model | Latency | Typical Target Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Paxos (Multi-Paxos)**| Single Leader | Two-Phase Propose/Accept | 2 RTTs | Chubby, Google Spanner |
| **Raft** | Strong Single Leader | Leader Election + Log Replication | 1-2 RTTs | etcd, Consul, CockroachDB |
| **Zab** | Primary-Backup Leader | Epoch Proposal Commit | 1-2 RTTs | Apache ZooKeeper |
| **PBFT / Tendermint** | Leader / Rotating | Byzantine Fault Tolerant (2f+1) | High (O(N^2)) | Blockchains, Untrusted Networks |

### Key Technical Concepts

- **Quorum Requirements**: To commit state safely, a proposal must be written to a majority of nodes: \(N/2 + 1\).
- **Safety Properties**: Only one leader per term (Term Uniqueness) and committed log entries are never overwritten (Leader Completeness).
- **Split-Brain Prevention**: Ensures disjoint node subsets cannot both form a valid voting majority.

### Key takeaway

Distributed consensus relies on **majority voting (quorums) and replicated log state machines** to maintain a single source of truth across failing network nodes.
