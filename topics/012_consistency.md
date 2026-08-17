# Consistency

> **Category:** System Design Basics

---

Consistency defines **the degree to which all nodes in a distributed system see the exact same data at any given time**. Depending on the system requirements, architectures trade off strict consistency for performance and availability.

### Distributed Consistency Model Spectrum

```
+-------------------------------------------------------------------------+
|                      CONSISTENCY MODEL SPECTRUM                         |
+-------------------------------------------------------------------------+

  [ Strong Consistency ]  ----->  [ Causal Consistency ]  ----->  [ Eventual Consistency ]
  Linearizable Reads              Order Preserved for             Convergence After
  (Spanner, ZooKeeper)            Related Events                  Sync Delay (Cassandra)
  
  High Latency / Lower Avail                                Low Latency / High Avail
```

### Consistency Models Comparison

| Model | Guarantee | Typical Latency | Real-World Database Use Cases |
| :--- | :--- | :--- | :--- |
| **Strict / Linearizable**| Any read operation returns the result of the most recent write operation globally. | High (Requires synchronous consensus/locks) | Google Spanner, CockroachDB, etcd |
| **Sequential Consistency**| Operations take place in some sequential order, consistent across all nodes. | Medium-High | Distributed lock managers |
| **Causal Consistency** | Operations that are causally related are seen by every node in the same order. | Medium | Social media comment threads, collaborative document editing |
| **Read-Your-Writes** | A user who updates data will always see their update on subsequent reads. | Medium-Low | E-commerce user profiles, account settings |
| **Eventual Consistency** | If no new updates are made, all replicas will eventually converge to identical data. | Low | Cassandra, Amazon DynamoDB, DNS system |

### How Consistency is Implemented

1. **Synchronous Replication**: Writes are committed to primary and all secondary nodes before returning success to the client. Guarantees strong consistency but increases write latency.
2. **Consensus Protocols**: Distributed consensus algorithms (Raft, Paxos, ZAB) elect leaders and enforce majority quorum (Q_write + Qᵣead > N) for reads and writes.
3. **Asynchronous Background Replication**: Writes commit locally on primary node and propagate asynchronously to replicas. Low write latency, but risks stale reads.

### Key takeaway

Select consistency models based on business domain requirements. Use **strong linearizable consistency** for financial balances and inventory locks where stale reads cause corruption, and **eventual consistency** for social feeds and telemetry where low latency takes priority.
