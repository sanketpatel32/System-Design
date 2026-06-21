# Write Scaling

> **Category:** Scaling

---

Write scaling = **handling more writes per second** than a single DB can serve. The hardest
scaling problem, because writes can't simply be replicated.

### Why writes are hard
- One primary accepts writes (most setups) — it's a bottleneck.
- Writes need **durability** (fsync to WAL) → inherently slower than reads.
- Writes need **consistency** (locks, transactions).

### Scaling strategies (in order of complexity)

#### 1. Optimize the write itself
- Batch inserts: 1 INSERT with 1000 rows vs 1000 INSERTs.
- Use COPY (Postgres) / LOAD DATA INFILE (MySQL) for bulk.
- Remove unnecessary indexes (each index slows writes).
- Tune WAL / fsync settings.

#### 2. Queue and async-process
- Write to Kafka → worker batches → bulk insert.
- Smoothes spikes; trade latency for throughput.

#### 3. Sharding
- Split data by key (user_id) across N primaries.
- Each shard handles 1/N of writes.
- Adds cross-shard complexity (joins, transactions).

#### 4. Multi-master
- Multiple nodes accept writes.
- Needs conflict resolution (last-write-wins, CRDTs, vector clocks).
- Hard to get right.

#### 5. Distributed DB
- Cassandra, DynamoDB, Spanner — sharding + replication built-in.
- Trade SQL/transactions/consistency for write throughput.

### Worked example
- Need 100k writes/sec.
- Postgres on a big box: ~10-30k writes/sec.
- Shard across 5 primaries: 50-150k writes/sec.

### Key takeaway
Scale writes by **(1) optimizing the write, (2) queue+batch, (3) sharding, (4) multi-master, (5)
distributed DB**. Sharding is almost always the answer at scale — accept the complexity.
