# Multi-Region Deployment

> **Category:** Reliability and Fault Tolerance

---

A Multi-Region Deployment distributes application compute and data stores across **geographically isolated cloud regions**, achieving global high availability, disaster resilience, and reduced user latency.

### Multi-Region Global Architecture

```
+-----------------------------------------------------------------------------------+
|                        Global Anycast DNS / Latency Router                        |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                | Route to Closest Region                           | Disaster Failover
                v                                                   v
+------------------------------------+                    +------------------------------------+
| Region 1: US-East (Active)         |                    | Region 2: EU-West (Active)         |
| - API Gateway & App Pods           |                    | - API Gateway & App Pods           |
| - Local Read/Write Database        | <--- Cross-Region  | - Local Read/Write Database        |
|                                    |      Replication   |                                    |
+------------------------------------+                    +------------------------------------+
```

### Multi-Region Topology Comparison

| Topology Pattern | Data Write Model | Read Latency | Write Latency | Cross-Region Traffic Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Primary/Standby (Global Read)** | Single Primary Region | Low (Local Replicas) | High (Cross-region write) | Low |
| **Multi-Primary (Active-Active)**| Local Regional Writes | Ultra-Low | Ultra-Low | High (Sync / Conflict resolution)|
| **Partitioned / Cell Architecture**| User Sharded by Geography | Ultra-Low | Ultra-Low | Minimal (No cross-cell talk) |

### Engineering Challenges

- **Cross-Region Database Latency**: Inter-region network latency (e.g. 100-200ms between US and Asia) makes synchronous multi-region 2PC locks impractical.
- **Egress Bandwidth Costs**: Replicating high-throughput data streams across cloud regions generates significant egress billing.

### Key takeaway

Deploy multi-region architectures using **geographical user partitioning or asynchronous data replication** to provide global low latency and regional failure isolation.
