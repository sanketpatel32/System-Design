# Estimate Database Size

> **Category:** Back-of-the-Envelope Estimation

---

Estimating **Database Size and Sharding Requirements** determines whether a system can run on a single primary database instance or requires horizontal **database sharding** across multiple data nodes based on write throughput and storage limits.

### Database Scale Partitioning Decision Pipeline

```
+-------------------------------------------------------------------------+
|                DATABASE PARTITIONING DECISION PIPELINE                  |
+-------------------------------------------------------------------------+

  [ Total Daily Writes & Storage Growth ]
                     |
                     v
  +-----------------------------------------------------------------------+
  | Evaluate Single Primary Limits:                                        |
  | - Max Write Throughput (~5,000 TPS for SQL)                           |
  | - Max NVMe Storage (~4 TB to 8 TB per node)                           |
  +-----------------------------------------------------------------------+
                     |
         +-----------+-----------+
         | (Exceeds Limits)      | (Within Limits)
         v                       v
  [ Database Sharding Required ]  [ Single Primary + Read Replicas ]
  (Partition by user_id/key)      (Divert reads to replicas)
```

### Database Scaling Limits Reference Table

| DB Metric / Bound | Single Relational Node (PostgreSQL/MySQL) | Distributed NoSQL (Cassandra/DynamoDB) |
| :--- | :--- | :--- |
| **Max Write Throughput** | 2,000 - 10,000 TPS | Unlimited (Linear scale per shard) |
| **Max Storage per Node**| 4 TB - 16 TB (NVMe SSD limit) | 2 TB - 4 TB per shard recommended |
| **Read Capacity** | High (via 5-10 Read Replicas) | High (via read routing) |
| **Primary Bottleneck** | Write IOPS contention, WAL lock sync | Cross-shard JOINs, global indexes |

### Step-by-Step Sharding & DB Sizing Walkthrough

1. **Calculate Write Throughput**:
   - Given Peak Write QPS = 25,000 Write QPS.
   - Single MySQL primary max write throughput = 5,000 TPS.

**Minimum Write Shards Required** = (25,000 Write QPS) / 5,000 TPS/node = 5 Write Shards

2. **Calculate 5-Year Database Storage Horizon**:
   - Daily write data = 100 GB/day.
   - 5-year total storage = 100 GB × 365 × 5 = 182.5 TB.

3. **Determine Shard Node Count Based on Storage Limit**:
   - If maximum recommended storage per database shard node = 2 TB:

**Minimum Storage Shards Required** = 182.5 TB / 2 TB/shard ≈ 92 Shards

4. **Select Final Shards Count**:
   - Take the maximum of Write Shards (5) vs Storage Shards (92).
   - Round up to power of 2 for easy hash ring partitioning: **128 Database Shards**.

### Key takeaway

Compare total write TPS and 5-year storage projections against single-node database limits (~5,000 TPS write, ~2-4 TB storage). If limits are exceeded, design for **horizontal database sharding** using a consistent hash partition key.
