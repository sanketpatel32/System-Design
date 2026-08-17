# Design Multi Region Database

> **Category:** Advanced System Design Problems

---

A Multi-Region Database spans multiple geographic regions to deliver local low-latency access for global users, business continuity, and regional disaster recovery (DR).

### System Requirements
- **Functional Requirements**:
  - Support cross-region reads and writes.
  - Configurable consistency levels (Strong Multi-Region Consistency vs Eventual Replication).
  - Automatic failover when an entire cloud region goes offline.
- **Non-Functional Requirements**:
  - Low Read Latency: Sub-10ms reads locally in any deployed region.
  - High Availability: Zero data loss (RPO=0) and near-zero downtime (RTO < 5 seconds) during regional failure.
  - Global Partitioning: Comply with data residency laws (e.g. GDPR).

### System Architecture (Multi-Region Active-Active)
```
     [ Region US-East ]                                          [ Region EU-West ]
+---------------------------+                               +---------------------------+
| [ API App ] -> [ DB Node ]|                               | [ API App ] -> [ DB Node ]|
|      (Raft Leader)        |                               |     (Raft Follower)       |
+-------------+-------------+                               +-------------+-------------+
              |                                                           |
              +-------------------> [ Consensus Network ] <---------------+
                                    (Paxos / Raft Engine)
                                              |
                                              v
                              [ Global Clock (TrueTime / HLC) ]
```

### Multi-Region Topology Matrix
| Topology Pattern | Write Routing | Read Latency | Conflict Management |
|---|---|---|---|
| **Active-Passive (Primary-Standby)** | All writes routed to single Primary region | Low locally; high for cross-region writes | No conflict; synchronous or async replication stream. |
| **Active-Active (Multi-Primary)** | Writes accepted in any local region | Low everywhere | Requires CRDTs, Vector Clocks, or Last-Write-Wins (LWW). |
| **Geo-Partitioned (Spanner/Cockroach)** | Writes routed to regional partition consensus leader | Low locally for region-pinned data | Multi-Paxos consensus + TrueTime/HLC atomic timestamps. |

### Key takeaway
Multi-region databases balance latency against consistency by using geo-partitioning and consensus protocols (Raft/Paxos) backed by global synchronized clocks (TrueTime/HLC) to guarantee multi-region ACID transactions.
