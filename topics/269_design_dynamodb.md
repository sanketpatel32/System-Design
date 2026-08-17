# Design DynamoDB

> **Category:** Distributed Systems Infrastructure

---

Amazon DynamoDB is a fully managed NoSQL database service delivering predictable single-digit millisecond performance with automatic scaling and multi-region replication.

### System Requirements
- **Functional Requirements**:
  - Key-value and document data model queries using Partition Keys (PK) and Sort Keys (SK).
  - Global Secondary Indexes (GSI) and Local Secondary Indexes (LSI) for flexible querying.
  - Transactional operations (ACID across multi-item requests).
- **Non-Functional Requirements**:
  - High Scalability: Auto-scale storage and throughput indefinitely.
  - Predictable Latency: < 10 ms for read and write operations at any scale.
  - High Availability: 99.99% SLA backed by multi-AZ replication.

### System Architecture
```
[ Client SDK ] ---> [ Request Router Layer ]
                             |
                             v
               [ Storage Node Partition Group ]
  +--------------------------+--------------------------+
  | (Paxos Replication Group across 3 Availability Zones)  |
  v                          v                          v
[ Storage Node 1 (Leader) ] [ Storage Node 2 (Follower) ] [ Storage Node 3 (Follower) ]
(B-Tree / Storage Engine)   (B-Tree / Storage Engine)   (B-Tree / Storage Engine)
```

### Capacity Modes & Index Trade-offs
| Provisioning Mode | Unit Definition | Ideal Workload |
|---|---|---|
| **Read Capacity Unit (RCU)** | 1 RCU = 1× 4 KB strongly consistent read/sec | Predictable application traffic. |
| **Write Capacity Unit (WCU)** | 1 WCU = 1× 1 KB write/sec | Stable, known throughput demands. |
| **On-Demand Mode** | Pay per request instantly | Unpredictable or bursty application workloads. |

| Index Type | Partition Key | Sort Key | Async / Sync |
|---|---|---|---|
| **Local Secondary Index (LSI)** | Same as base table PK | Different SK | Synchronous; shares base table partition capacity. |
| **Global Secondary Index (GSI)** | Can differ from base table PK | Can differ from base table SK | Asynchronous propagation; possesses independent provisioned capacity. |

### Key takeaway
DynamoDB uses request routers to hash Partition Keys onto Paxos-replicated storage partition groups, ensuring predictable sub-10ms performance using isolated provisioned capacity units (RCUs/WCUs) and secondary indexes.
