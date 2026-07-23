# Estimate Database Size

> **Category:** Back-of-the-Envelope Estimation

---

Database size estimates drive disk provisioning, replication cost, and sharding decisions.

### Formula
```
DB size = rows × avg_row_size × (1 + index_overhead) × replication_factor
```

### Row size rules of thumb
| Data | Bytes |
|------|-------|
| Short URL record | 100-300 B |
| User profile | 1-2 KB |
| Tweet/post | 500 B |
| Order row (e-commerce) | 1 KB |
| Log/event row | 200-500 B |
| Image metadata | 500 B |

### Index overhead
- **Primary index**: included in row size.
- **Secondary indexes**: each adds ~10-30% of base size.
- A typical OLTP table with 3-4 indexes is **2-3x** its raw row size.

### Worked example — URL shortener
- 100M new URLs/day, retention 10 years
- 100M × 365 × 10 = 365B rows
- × 200B = 73 TB raw
- × 2.5 (indexes) = 182 TB
- × 3 (replicas) = **~550 TB total**

### When to shard
- **< 1 TB**: single Postgres/MySQL is fine.
- **1-10 TB**: consider sharding by tenant / time.
- **> 10 TB**: definitely sharded or use a distributed DB (Cassandra, Spanner).

### Compression
- Postgres TOAST + LZ4: ~50% on text blobs.
- Columnar storage (BigQuery, ClickHouse): 5-10x on analytical data.

### Key takeaway
DB size = **rows × row_size × 2.5 (indexes) × 3 (replicas)**. When the result crosses ~1 TB per
shard, plan for partitioning.
