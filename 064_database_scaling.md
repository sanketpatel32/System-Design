# Database Scaling

> **Category:** Scaling

---

Databases are the **hardest** part to scale. Unlike stateless services, you can't just add
instances — the data has to live somewhere.

### Scaling ladder
```
1. Single node, vertical scale          (more CPU/RAM/disk)
2. Read replicas                        (offload reads)
3. Caching layer                        (avoid DB hits)
4. Vertical + horizontal partitioning   (sharding)
5. Distributed DB                       (Cassandra, Spanner, CockroachDB)
```

### Step 1: Vertical
- Bigger instance, more RAM = larger buffer pool, faster.
- Easy, no code change.
- Hits a ceiling (largest RDS instance, etc.).

### Step 2: Read replicas
- Writes go to **primary**, reads fan out to **replicas**.
- Trade-off: replication lag → stale reads.
- Great for read-heavy workloads (10:1 read:write).

### Step 3: Caching
- Redis/Memcached in front of DB.
- Absorbs 80-95% of reads.
- Doesn't help writes.

### Step 4: Sharding
- Partition data by a key (user_id) across N shards.
- Each shard is independent → N× write throughput.
- Adds enormous complexity (cross-shard queries, joins, transactions).

### Step 5: Distributed DB
- Built-in sharding, replication, failover.
- Examples: Cassandra, DynamoDB, Spanner, CockroachDB.
- Trade consistency / SQL / ops simplicity for scale.

### Scaling writes specifically
- **Batch writes** (1 big INSERT vs 1000 small).
- **Queue + bulk insert** (Kafka → worker → batch).
- **Partitioning by time** (time-series DBs).
- **Sharding** for horizontal write scale.

### Key takeaway
Scale DBs in order: **vertical → replicas → cache → shard → distributed DB**. Each step adds
complexity. Don't shard until you've exhausted the previous steps.
