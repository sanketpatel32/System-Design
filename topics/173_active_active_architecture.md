# Active-Active Architecture

> **Category:** Reliability and Fault Tolerance

---

Active-Active architecture is a deployment pattern where **two or more independent nodes or datacenters actively process live application traffic concurrently**. Requests are load balanced across all active nodes, providing zero-downtime failover and maximum infrastructure utilization.

### Active-Active Multi-Region Architecture

Traffic is dynamically distributed across all active regional sites, requiring continuous bi-directional database synchronization.

```
+----------------------------------------------------------------------------------------------------+
|                                    Global Anycast Load Balancer                                    |
+----------------------------------------------------------------------------------------------------+
                                      /                                \
             50% Traffic (Region A)  /                                  \ 50% Traffic (Region B)
                                    v                                    v
+---------------------------------------+    Bi-Directional State   +---------------------------------------+
| Region A (Active Stack)               | <=======================> | Region B (Active Stack)               |
| - App Cluster A                       |    Replication Stream     | - App Cluster B                       |
| - Multi-Master DB (Node A)            |                           | - Multi-Master DB (Node B)            |
+---------------------------------------+                           +---------------------------------------+
```

### Active-Active vs Active-Passive Comparison Matrix

| Dimension | Active-Active Architecture | Active-Passive Architecture |
| :--- | :--- | :--- |
| **Traffic Distribution** | 100% of compute capacity actively used across nodes | 100% traffic routed to Primary; Standby sits idle |
| **RPO & RTO** | Near-zero RPO, instant sub-second RTO failover | Non-zero RPO (Async), 30s-15m RTO failover |
| **Data Synchronization** | Bi-directional Multi-Master (DynamoDB Global, Spanner)| Mono-directional Primary -> Standby Replication |
| **Write Conflict Handling**| Requires Conflict Resolution (CRDTs, LWW, Vector Clocks) | No conflict resolution needed (Single Primary Writer) |
| **Infrastructure Cost** | Higher (Requires symmetric capacity across regions) | Moderate (Standby can be provisioned smaller) |

### Key Technical Challenges in Active-Active Systems

1. **Bi-Directional Replication Lag & Conflicts**: Simultaneous updates to the same user record in Region A and Region B cause data divergence. Systems must resolve conflicts using **CRDTs**, **Last-Write-Wins (LWW)**, or **Sticky Sessions (Pinning user traffic to a specific region)**.
2. **Symmetric Capacity Provisioning**: Each region must maintain sufficient headroom to absorb 100% of total global traffic immediately if the peer region fails.

### Key Trade-offs & Design Guidance

- ✅ **Instant Zero-Downtime Failover**: Losing a region simply redirects traffic to remaining active nodes without manual intervention.
- ✅ **100% Resource Utilization**: No hardware sits idle waiting for failure.
- ❌ **Complex Multi-Master Data Layer**: Multi-master replication conflicts present severe operational complexity.
### Active-Active Multi-Master Conflict Resolution Rules

1. **User Pinning (Sticky Sessions)**: Route user $U$ to Region A for all reads/writes. Transmit cross-region updates asynchronously for disaster recovery.
2. **CRDT Data Structures**: Use Conflict-Free Replicated Data Types for counters and sets.
3. **Partition Key Isolation**: Assign region-specific key ranges (e.g. Region A generates even UUIDs, Region B generates odd UUIDs) to prevent primary key collisions.
### DynamoDB Global Tables Active-Active Configuration Pattern

```json
{
  "TableName": "GlobalOrders",
  "AttributeDefinitions": [
    { "AttributeName": "OrderId", "AttributeType": "S" }
  ],
  "KeySchema": [
    { "AttributeName": "OrderId", "KeyType": "HASH" }
  ],
  "ReplicationGroup": [
    { "RegionName": "us-east-1" },
    { "RegionName": "eu-central-1" },
    { "RegionName": "ap-northeast-1" }
  ],
  "BillingMode": "PAY_PER_REQUEST"
}
```

### Active-Active Traffic Routing & Isolation Patterns

- **Geographic User Pinning**: Route EU users strictly to `eu-central-1` and US users to `us-east-1`. This eliminates cross-region concurrent write conflicts for user-owned records.
- **Asynchronous Backlog Drain**: If Region A drops off the network, Region B buffers incoming transactions and drains the cross-region replication queue automatically once Region A recovers.

### Key takeaway

Active-Active architecture delivers **zero-downtime failover and 100% resource utilization**, but requires sophisticated multi-master database replication and conflict resolution strategies.
