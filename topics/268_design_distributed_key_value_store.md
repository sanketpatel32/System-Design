# Design Distributed Key Value Store

> **Category:** Distributed Systems Infrastructure

---

A Distributed Key-Value Store manages key-value pair storage across a cluster of nodes, guaranteeing high availability, partition tolerance, and predictable performance (e.g., Amazon Dynamo, Riak).

### System Requirements
- **Functional Requirements**:
  - `get(key)` and `put(key, value)` operations.
  - Configurable consistency levels (Eventual vs Strong Consistency).
  - Automatic data partitioning and node membership management.
- **Non-Functional Requirements**:
  - High Availability: Read/write availability even during network partitions (CAP theorem AP emphasis).
  - Horizontal Scalability: Seamless addition or removal of nodes without downtime.
  - Low Latency: Single-digit millisecond operations.

### System Architecture (Dynamo-Style Ring)
```
                  [ Consistent Hashing Ring ]
                       (Node A, B, C, D)
                             /                           [Node A]  [Node B]
                          \        /
                           [Node C]
                              |
                              v
             +----------------+----------------+
             |                                 |
             v                                 v
   [ Quorum (N=3, R=2, W=2) ]        [ Anti-Entropy (Merkle Trees) ]
```

### Core Architectural Components
| Component | Mechanism | Purpose |
|---|---|---|
| **Partitioning** | Consistent Hashing with Virtual Nodes | Evenly distributes keys across ring nodes without mass reshuffling on node changes. |
| **Replication** | Sloppy Quorum (N replicas, W write nodes, R read nodes) | Guarantees read consistency when R + W > N. |
| **Failure Handling** | Hinted Handoff | Neighbor nodes temporarily buffer writes for an offline node. |
| **Data Synchronization** | Merkle Trees (Hash Trees) | Rapidly detects key discrepancies between replicas during background anti-entropy sync. |
| **Conflict Resolution** | Vector Clocks / CRDTs / Last-Write-Wins (LWW) | Resolves concurrent concurrent writes across distinct cluster nodes. |

### Key takeaway
A Dynamo-style distributed key-value store combines consistent hashing rings, configurable sloppy quorums (R+W > N), vector clocks, and Merkle tree anti-entropy to provide high availability and tunable consistency.
