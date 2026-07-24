# Multi-Master Replication

> **Category:** Databases

---

**Multi-Master Replication** (or Multi-Primary Replication) is a database topology where two or more database nodes act as primaries, concurrently accepting read and write operations. Nodes continuously synchronize write operations asynchronously, ensuring data availability across geographically distributed data centers.

### Topology blueprint

```
            Data Center A (US-East)                 Data Center B (EU-West)
          +-------------------------+             +-------------------------+
          |     Master Node A       |             |     Master Node B       |
          |  (Accepts Local Writes) |             |  (Accepts Local Writes) |
          +-------------------------+             +-------------------------+
                       \                               /
                        \     Cross-Region Async      /
                         \    Bidirectional Sync     /
                          +-------------------------+
```

### Write conflicts & resolution mechanisms

Because multiple primary nodes accept writes concurrently for the same records, multi-master systems must detect and resolve write conflicts:

1. **Last-Write-Wins (LWW)**: Resolves conflicts by retaining the update with the latest physical wall-clock timestamp. *Risk: Clock drift between servers can overwrite legitimate writes.*
2. **Conflict-Free Replicated Data Types (CRDTs)**: Specialized data structures (counters, sets) that merge concurrent modifications deterministically without locks.
3. **Conflict Resolution Triggers / Operational Transformation**: Executes custom application logic or keeps both versions for manual resolution.

### Multi-Master Evaluation Matrix

| Architectural Dimension | Single-Master Replication | Multi-Master Replication |
| :--- | :--- | :--- |
| **Write Availability** | Single Point of Failure (Primary down = no writes) | High (Writes continue on remaining active masters) |
| **Cross-Region Latency** | High write latency for remote users | Low write latency (Writes land in nearest regional master) |
| **Conflict Complexity** | Zero write conflicts | High conflict probability (Requires conflict resolution rules) |
| **Transaction Integrity** | Strict ACID transactions supported | Distributed locking or eventual consistency required |

### Key takeaway

Multi-Master replication enables low-latency writes across geographically distributed regions and eliminates single-master write bottlenecks. However, it introduces complex write conflict resolution challenges that require mechanisms like CRDTs or Last-Write-Wins policies.
