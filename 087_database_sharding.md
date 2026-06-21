# Database Sharding

> **Category:** Databases

---

Database sharding = **partitioning data across multiple database instances** so each shard
holds a subset. The fundamental horizontal scaling technique.

### Why
- Single DB hit ceiling (CPU, RAM, disk, write throughput).
- Need more capacity than the biggest instance can give.

### How
Pick a **shard key** (user_id, tenant_id, geo) and route:
```
shard = hash(shard_key) % N
```

### Example
```
user_id 12345 -> hash(12345) % 4 = 2 -> shard 2
```
All of user 12345's data lives on shard 2.

### Shard key choice is critical
- **High cardinality** — even distribution.
- **Low skew** — no hot keys.
- **Query locality** — most queries hit one shard.
- **Immutable** — changing it means moving data.

### Strategies
- **Hash-based**: even distribution, range queries hard.
- **Range-based**: range queries easy, hotspots possible.
- **Directory**: lookup table maps key → shard, most flexible.
- **Geo**: by region.

### Cross-shard challenges
- **Joins** — can't join across shards; denormalize or app-level join.
- **Transactions** — distributed transactions (2PC) slow; use Saga.
- **Aggregations** — `COUNT` needs fan-out + merge.
- **Global uniqueness** — coordinate ID generation.
- **Rebalancing** — adding shards moves data.

### Tooling
- **Vitess** — shards MySQL, used by YouTube, Slack.
- **Citus** — Postgres extension for sharding.
- **MongoDB** — built-in sharding.
- **Cassandra** — built-in via consistent hashing + vnodes.

### When NOT to shard
- Vertical scaling + replicas + cache still sufficient.
- You're not ready for the operational complexity.

### Key takeaway
Sharding scales writes and storage beyond one machine. **Pick the shard key carefully**. Don't
shard until vertical scaling, read replicas, and caching are exhausted — sharding adds huge
complexity.
