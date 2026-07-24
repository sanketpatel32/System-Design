# Strong Consistency

> **Category:** Distributed Systems

---

Strong Consistency (Linearizability) guarantees that **every read operation receives the most recent write**, making a distributed cluster behave as if it were executing on a single atomic machine.

### Strong Consistency Read/Write Enforcement

```
+----------+      1. Write Update (v=5)      +-------------------+      2. Synchronous Replicate     +-------------------+
| Client A | ------------------------------> | Primary / Leader  | ---------------------------------> | Replica Node      |
+----------+                                 +-------------------+                                   +-------------------+
                                                       |                                                       |
                                                       |<------------------------------------------------------|
                                                       | 3. All ACKs Received                                  |
                                                       v                                                       |
                                             +-------------------+                                             |
| Client B | <------------------------------ | Return Write OK   |                                             |
+----------+   4. Read Request (Guaranteed v=5) +-------------------+                                             v
```

### Strong vs Eventual Consistency Comparison

| Dimension | Strong Consistency (Linearizable) | Eventual Consistency |
| :--- | :--- | :--- |
| **Read Guarantee** | Always latest state guaranteed | May return stale data temporarily |
| **Write Performance** | Slower (Synchronous Replication / 2PC) | Fast (Local Memory / Async ACK) |
| **Availability (CAP)**| Sacrifices Availability during partitions (CP)| Sacrifices Consistency during partitions (AP)|
| **Complexity** | Simple mental model for app developer | Complex application conflict resolution |
| **Example Systems** | Spanner, CockroachDB, etcd, PostgreSQL | Cassandra, DynamoDB, Redis |

### Key Protocols Enabling Strong Consistency

- **Consensus Consensus (Raft / Paxos)**: Multi-node majority approval before committing writes.
- **Synchronous Master-Replica Replication**: Delaying client ACKs until all backup nodes write to disk.

### Key takeaway

Strong consistency provides **linearizable read-after-write guarantees** at the expense of higher write latency and reduced availability during network partitions.
