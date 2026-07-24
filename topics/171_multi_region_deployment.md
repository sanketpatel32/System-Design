# Multi-Region Deployment

> **Category:** Reliability and Fault Tolerance

---

A multi-region deployment distributes application compute, data storage, and network routing across **two or more distinct geographical cloud regions** (e.g. `us-east-1` and `eu-central-1`). Multi-region architectures provide resilience against entire cloud region outages while reducing latency for global users by routing traffic to the nearest geographic datacenter.

### Multi-Region Architecture & Global Anycast Routing

Global Anycast DNS or Cloudfront/Global Accelerator routes traffic to the nearest regional stack, while database cross-region replication keeps state synchronized.

```
                                  +-----------------------+
                                  | Global Anycast DNS /  |
                                  | Cloud Accelerator     |
                                  +-----------------------+
                                     /                 \
            Geo-DNS Routing (US User)                   Geo-DNS Routing (EU User)
                                   /                     \
                                  v                       v
      +-----------------------------------+       +-----------------------------------+
      | Region 1: US-East                 |       | Region 2: EU-Central              |
      | - ALB + Auto-Scaling App Workers  |       | - ALB + Auto-Scaling App Workers  |
      | - Regional Database Primary       |       | - Read Replica / Multi-Master Node|
      +-----------------------------------+       +-----------------------------------+
                          |                                       ^
                          +--- Asynchronous Cross-Region ---------+
                               Replication (DB WAL & S3 Buckets)
```

### Multi-Region Architectural Strategies Comparison Matrix

| Strategy | Compute State | Database State | RPO / RTO | Complexity & Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Active-Passive (Hot/Cold)** | Primary live; Standby cold | Async Cross-Region Read Replica | RPO: Seconds, RTO: 5-15 mins | Moderate cost |
| **Active-Active (Multi-Primary)**| Fully live in both regions | Multi-Master (DynamoDB Global Tables / CockroachDB) | RPO: ~0, RTO: ~0 | Highest cost & operational complexity |
| **Isolated Regional Stacks** | Completely independent stacks | No cross-region DB replication (Siloed by country)| RPO: N/A, RTO: Instant | Low complexity (Data residency compliant) |

### Key Technical Challenges

1. **Cross-Region Database Latency**: Inter-region network latency (e.g. US to Europe ~70-100ms) makes synchronous multi-region database commits impossibly slow. Multi-region DBs rely on **asynchronous replication** or **geographically sharded partitions**.
2. **Data Sovereignty & Compliance (GDPR)**: Regulations mandate that European user PII data must reside physically within EU borders, restricting cross-region data transfers.
3. **Split-Brain Risk**: If cross-region health checks fail due to an ocean cable cut, both regions might declare themselves Primary, causing conflicting concurrent writes.

### Key Trade-offs & Production Guidelines

- ✅ **Survives Total Cloud Region Disasters**: Keeps services online even if AWS `us-east-1` suffers a catastrophic outage.
- ✅ **Global Latency Optimization**: Serves dynamic content from datacenters physically close to end users.
- ❌ **Massive Expense & Complexity**: Multi-region bandwidth egress costs and cross-region database conflict resolution significantly increase operational spending.
### AWS Global Accelerator Anycast Routing Architecture

```
Global User -> Anycast IP (AWS Edge PoP) 
               |
               v AWS Private Fiber Backbone
+-----------------------------------------------------------------------+
| Health Probe Engine: Routes to Region 1 (Primary) or Region 2 (Secondary)|
+-----------------------------------------------------------------------+
```

### Key takeaway

Multi-region deployments protect against **entire cloud region outages and reduce global latency**, but require careful data sharding and asynchronous replication strategies to handle inter-region network latencies.
