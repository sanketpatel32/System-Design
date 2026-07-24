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
   - Given $\text{Peak Write QPS} = 25,000\,\text{Write QPS}$.
   - Single MySQL primary max write throughput $= 5,000\,\text{TPS}$.

$$\text{Minimum Write Shards Required} = \frac{25,000\,\text{Write QPS}}{5,000\,\text{TPS/node}} = 5\,\text{Write Shards}$$

2. **Calculate 5-Year Database Storage Horizon**:
   - Daily write data $= 100\,\text{GB/day}$.
   - 5-year total storage $= 100\,\text{GB} \times 365 \times 5 = 182.5\,\text{TB}$.

3. **Determine Shard Node Count Based on Storage Limit**:
   - If maximum recommended storage per database shard node $= 2\,\text{TB}$:

$$\text{Minimum Storage Shards Required} = \frac{182.5\,\text{TB}}{2\,\text{TB/shard}} \approx 92\,\text{Shards}$$

4. **Select Final Shards Count**:
   - Take the maximum of Write Shards (5) vs Storage Shards (92).
   - Round up to power of 2 for easy hash ring partitioning: **128 Database Shards**.

### Key takeaway

Compare total write TPS and 5-year storage projections against single-node database limits (~5,000 TPS write, ~2-4 TB storage). If limits are exceeded, design for **horizontal database sharding** using a consistent hash partition key.
