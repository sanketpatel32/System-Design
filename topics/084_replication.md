# Replication

> **Category:** Databases

---

**Database Replication** is the process of copying and maintaining database objects and data across multiple physical server nodes. Replication provides data redundancy, increases read scalability, ensures fault tolerance during hardware failures, and minimizes latency by placing data geographically closer to users.

### High-Level Architecture

```
                        +--------------------+
                        |  Client / App Tier |
                        +--------------------+
                           /              \
                 Writes   /                \ Reads
                         v                  v
                +---------------+   +---------------+
                | Primary Node  |   | Secondary Node|
                | (Master / R/W)|   | (Replica / RO)|
                +---------------+   +---------------+
                        |                   ^
                        | Transaction Logs  |
                        +--(WAL Stream)-----+
```

### Primary replication topologies

1. **Single-Leader (Primary-Replica)**: All writes route to a designated primary node. The primary streams state changes via Write-Ahead Logs (WAL) to secondary nodes that process read queries.
2. **Multi-Leader (Multi-Primary)**: Multiple nodes accept writes concurrently. Leaders synchronize updates asynchronously. Common in multi-region deployments.
3. **Leaderless (Dynamo-style)**: Any node can accept read and write requests. Clients write to multiple nodes concurrently using quorum protocols (W + R > N).

### Replication Mode Comparison

| Mode | Write Latency | Data Consistency Guarantee | Failover Data Loss Risk |
| :--- | :--- | :--- | :--- |
| **Asynchronous** | Ultra-low (Primary responds immediately) | Eventual Consistency (Subject to replication lag) | High (Un-streamed WAL logs lost on crash) |
| **Synchronous** | High (Primary blocks until all replicas commit) | Strong Consistency (Zero replication lag) | Zero data loss, but slow replica blocks writes |
| **Semi-Synchronous**| Moderate (Primary waits for 1 replica log ACK)| High Consistency | Minimal data loss risk |

### Key takeaway

Database replication distributes copies of data across servers to ensure high availability and read scalability. Balance synchronous replication for strong consistency against asynchronous replication for low write latency.
