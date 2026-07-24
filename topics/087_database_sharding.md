# Database Sharding

> **Category:** Databases

---

**Database Sharding** is the process of partitioning a single logical database across multiple autonomous database instances (shards). Unlike simple horizontal partitioning on a single machine, each shard in a sharded architecture operates on independent hardware with its own CPU, memory, and disk.

### System architecture

```
                     +-----------------------------------+
                     |       Shard Router / Middleware   |
                     |         (e.g., Vitess / Citus)    |
                     +-----------------------------------+
                         /             |             \
           Hash(User_ID)/              |              \
               % 3 = 0 /      % 3 = 1  |       % 3 = 2 \
                      v                v                v
               +--------------+ +--------------+ +--------------+
               |   Shard 0    | |   Shard 1    | |   Shard 2    |
               | (DB Node A)  | | (DB Node B)  | | (DB Node C)  |
               +--------------+ +--------------+ +--------------+
```

### Sharding lifecycle stages

1. **Shard Key Selection**: Identify an attribute present in queries (e.g., `account_id`, `tenant_id`) with high cardinality and even access distribution.
2. **Routing Middleware**: Position a stateless proxy tier (Vitess, ProxySQL, Citus) to inspect incoming SQL statements, calculate target shard addresses from shard keys, and route queries.
3. **Scatter-Gather Execution**: For queries lacking a shard key, the middleware executes the query across all shards concurrently, merging the results before returning them to the app.

### Sharding trade-off matrix

| Capability | Unsharded Database | Sharded Database |
| :--- | :--- | :--- |
| **Storage & Throughput Limits**| Capped by single node hardware | Linearly scalable by adding shards |
| **Cross-Entity Joins** | Native fast SQL `JOIN`s | Prohibited or slow scatter-gather execution |
| **Transactions** | Native single-node ACID | Requires expensive two-phase commit (2PC) |
| **Schema Changes (DDL)** | Single DDL execution | Operations must be orchestrated across all shards |

### Key takeaway

Database sharding enables horizontal scaling of database writes and storage capacity. Select high-cardinality shard keys to ensure balanced data distribution, and denormalize schemas to avoid cross-shard joins.
