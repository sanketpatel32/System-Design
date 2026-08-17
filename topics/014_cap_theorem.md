# CAP Theorem

> **Category:** System Design Basics

---

The CAP Theorem (also known as Brewer's Theorem) states that any distributed data store can simultaneously provide **at most two** of the following three guarantees: **Consistency**, **Availability**, and **Partition Tolerance**.

In real-world distributed networks, **network partitions (P) are inevitable**. Therefore, when a partition occurs, system designers must choose between **Consistency (CP)** or **Availability (AP)**.

### CAP Theorem Choice Under Network Partition

```
                  +-----------------------+
                  |  NETWORK PARTITION    |
                  |  (Nodes A & B severed)|
                  +-----------------------+
                              |
                +-------------+-------------+
                |                           |
                v                           v
     +--------------------+       +--------------------+
     |    CP CHOICE       |       |    AP CHOICE       |
     | Reject write to B  |       | Accept write to B  |
     | (Preserve C)       |       | (Preserve A)       |
     +--------------------+       +--------------------+
        "Return Error to             "Return Stale/Divergent
         maintain state"              data to stay online"
```

### CAP System Classifications

| System Type | Trade-off Behavior During Partition | Real-World Systems | Best Suited Use Cases |
| :--- | :--- | :--- | :--- |
| **CP (Consistency + Partition Tolerance)** | Rejects reads/writes on partitioned nodes to prevent stale or conflicting state. | HBase, ZooKeeper, etcd, MongoDB (majority reads) | Financial ledgers, distributed locks, configuration management |
| **AP (Availability + Partition Tolerance)** | Accepts reads/writes on all operational nodes; data diverges and syncs later. | Cassandra, DynamoDB, Riak | Social media feeds, user shopping carts, telemetry ingest |
| **CA (Consistency + Availability)** | *Theoretical only in single-node systems*. Not achievable across distributed networks. | Traditional single-instance RDBMS (RDBMS without replication) | Non-distributed legacy databases on single server |

### The PACELC Extension to CAP Theorem

PACELC refines CAP theorem by evaluating behavior when the network is running normally (no partition):

If Partition (P) arrow choose Availability (A) or Consistency (C); Else (E) arrow choose Latency (L) or Consistency (C)

- **PC/EC (e.g., Spanner, CockroachDB)**: Chooses Consistency during partitions, and favors Consistency (at cost of higher latency) during normal operation.
- **PA/EL (e.g., Cassandra, DynamoDB)**: Chooses Availability during partitions, and favors Latency (eventual consistency) during normal operation.

### Key takeaway

During network partitions, systems cannot be both consistent and available. Choose **CP** when data correctness is mandatory (financial applications) and **AP** when service uptime is paramount (social media feeds). Use PACELC to evaluate latency vs. consistency in non-partitioned states.
