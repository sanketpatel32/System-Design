# Hot Partition Problem

> **Category:** Scaling

---

The **Hot Partition Problem** (or Hotspotting) occurs in partitioned and sharded systems when traffic or data volume is unevenly distributed, causing a single partition or shard to experience significantly higher load than others. This creates severe performance bottlenecks, high latencies, resource exhaustion, and potential node outages.

### System architecture

```
                     +-----------------------------------+
                     |       Shard Router / Proxy        |
                     +-----------------------------------+
                         /             |             \
               Shard 1  /     Shard 2  |              \ Shard 3
               (90% Req)               (5% Req)        (5% Req)
                       v               v                v
                +--------------+  +--------------+  +--------------+
                | HOT SHARD 🔥 |  | Cool Shard   |  | Cool Shard   |
                | (CPU 99%)    |  | (CPU 5%)     |  | (CPU 5%)     |
                +--------------+  +--------------+  +--------------+
```

### Common causes of hot partitions

1. **Celebrity / High-Traffic Entities**: A single user or tenant (e.g., a social account with tens of millions of followers) generating vast write or read volumes mapped to one shard.
2. **Monotonically Increasing Keys**: Sharding by date or timestamp, causing all current writes to hit only the most recent shard while older shards sit idle.
3. **Poor Shard Key Selection**: Selecting low-cardinality shard keys (e.g., `country` or `gender`) that concentrate large amounts of data on specific partitions.

### Mitigation strategies matrix

| Strategy | Mechanism | Best Used For | Trade-offs |
| :--- | :--- | :--- | :--- |
| **Key Salting / Suffixing** | Appending a random prefix/suffix (e.g., `celebrity_id_N`) | High-write celebrity entities | Scatter-gather required to aggregate reads |
| **Read Caching** | Layering Redis/CDN in front of hot partitions | High-read celebrity profiles | Cache invalidation complexity |
| **Consistent Hashing + Virtual Nodes** | Rebalancing data across virtual node ring | Uneven hardware allocation | Operational overhead during rebalancing |
| **Dynamic Resharding / Split** | Dynamically splitting a hot shard into sub-shards | Range-partitioned storage | Expensive runtime data migration |

### Code pattern: Shard key salting for writes

```
// Instead of writing to fixed shard: shard_key = user_id
// Append a random salt between 1 and 10 to split writes:
salted_shard_key = user_id + "_" + random(1, 10);
db.write(salted_shard_key, payload);

// Read path: Query all 10 salted keys concurrently and aggregate:
results = parallel_scatter_gather(user_id + "_1", ..., user_id + "_10");
```

### Key takeaway

Avoid hot partitions by selecting high-cardinality shard keys, avoiding sequential timestamp keys, and using key salting or dedicated caching layers for celebrity entities.
