# Sharding

> **Category:** Scaling

---

**Sharding** is a database architecture pattern that horizontally partitions a single logical dataset across multiple independent physical database nodes (shards). Each shard holds a unique subset of the data, allowing the system to scale both compute and storage capacity beyond the limits of a single machine.

### System architecture

```
                     +-----------------------------------+
                     |       Shard Router / Proxy        |
                     +-----------------------------------+
                         /             |             \
               Hash(Key) /             | Hash(Key)    \ Hash(Key)
                % 3 = 0 /              | % 3 = 1       \ % 3 = 2
                       v               v                v
                +--------------+  +--------------+  +--------------+
                |   Shard 0    |  |   Shard 1    |  |   Shard 2    |
                | (User 1-100) |  |(User 101-200)|  |(User 201-300)|
                +--------------+  +--------------+  +--------------+
```

### Partitioning strategies

Selecting an appropriate shard key and routing algorithm is critical for balancing load across shards:

1. **Key-Based (Hash) Sharding**: Applies a hash function to the shard key (e.g., `hash(user_id) % N`) to determine target shard. *Prevents hot spots, but resharding when changing N is expensive unless consistent hashing is used.*
2. **Range-Based Sharding**: Divides data based on contiguous ranges of a key (e.g., `user_id` 1–100,000 -> Shard 1). *Simplifies range queries, but risks hot spots if keys are sequential (e.g., timestamps).*
3. **Directory-Based Sharding**: Maintains a lookup service mapping entity IDs to specific shards. *Highly flexible, but introduces a lookup hop and single point of failure.*

### Sharding strategies trade-off matrix

| Sharding Strategy | Data Distribution | Range Query Efficiency | Resharding Complexity | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Hash-Based** | Uniformly Distributed | Poor (Scattered across shards) | High (Requires Consistent Hashing) | High-volume User IDs, Account Data |
| **Range-Based** | Prone to Hotspots | Excellent (Locality preserved) | Low (Add new ranges easily) | Historical archives, Geographic data |
| **Directory-Based** | Highly Customisable | Variable | Low (Update directory mapping) | Enterprise multi-tenant SaaS |

### Sharding challenges & mitigations

- **Cross-Shard Joins**: SQL `JOIN`s across shards are inefficient and require distributed scatter-gather queries. *Mitigation*: Denormalize data so related entities reside on the same shard.
- **Cross-Shard Transactions**: Operations spanning multiple shards require two-phase commit (2PC) protocols, incurring high network latency. *Mitigation*: Avoid cross-shard transactions using Saga or compensating transactions.
- **Hot Shards**: Certain shards receiving disproportionate traffic due to celebrity users or skewed keys. *Mitigation*: Append random salts to shard keys for high-volume entities.

### Key takeaway

Sharding allows horizontal scaling of databases for high-volume write and storage workloads. Choose a shard key aligned with primary access patterns, and denormalize data to avoid costly cross-shard joins and distributed transactions.
