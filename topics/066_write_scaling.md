# Write Scaling

> **Category:** Scaling

---

**Write Scaling** refers to the techniques and architectural patterns used to expand a system's capacity to process high volumes of incoming mutation operations (`INSERT`, `UPDATE`, `DELETE`). Unlike read scaling, which can be achieved via read replicas, write scaling requires addressing write locks, single-primary write bottlenecks, and storage I/O constraints.

### System architecture

```
                      +----------------------------------+
                      |         Application Tier         |
                      +----------------------------------+
                         /             |             \
               Shard Key/             / Shard Key     \ Shard Key
              `user_id: 1-1k`        / `user_id: 1k-2k`\ `user_id: 2k-3k`
                       v            v                   v
                +------------+  +------------+  +------------+
                |  DB Shard  |  |  DB Shard  |  |  DB Shard  |
                |   (Node A) |  |   (Node B) |  |   (Node C) |
                +------------+  +------------+  +------------+
                      |               |               |
                      +---------------+---------------+
                               Async Ingestion
                                (Kafka Buffer)
```

### Core write scaling techniques

1. **Database Sharding (Horizontal Partitioning)**: Distributes writes across independent database nodes by partitioning rows according to a shard key.
2. **Asynchronous Buffer / Queue Ingestion**: Buffers burst write spikes into message queues (Kafka, SQS) so background workers can execute batch inserts to disk without blocking users.
3. **LSM-Tree Storage Engines**: Replaces B-Trees (which require random disk writes) with Log-Structured Merge-trees (Cassandra, RocksDB) that convert random writes into sequential append-only writes in memory (MemTable) before flushing to SSTables.
4. **CQRS (Command Query Responsibility Segregation)**: Separates write operations completely from read paths, optimizing write tables for append performance.

### Write scaling techniques matrix

| Technique | Primary Mechanism | Pros | Cons / Complexity |
| :--- | :--- | :--- | :--- |
| **Horizontal Sharding** | Range or Hash partitioning | Scales write throughput linearly | Complex cross-shard queries and rebalancing |
| **Message Queue Ingestion** | Async batching via Kafka | Absorbs extreme burst writes instantly | Eventual consistency; write responses are async |
| **LSM-Tree Engines** | Sequential append-only I/O | High write throughput, no random write overhead | Read amplification and compaction CPU overhead |
| **Write Aggregation / Batching**| In-memory buffer combining writes | Minimizes disk write operations | Potential loss of buffered writes on node crash |

### High-throughput write patterns

- **Append-Only Immutable Logs**: Avoid `UPDATE` operations in place; write new event records instead and calculate state dynamically or asynchronously via event sourcing.
- **Conflict-Free Replicated Data Types (CRDTs)**: Enable concurrent writes on multiple nodes that converge automatically without requiring centralized locking.

### Key takeaway

Scaling write traffic requires eliminating centralized write locks. Achieve this by using message queues for async batch ingestion, horizontal sharding across partition keys, or append-only LSM-tree storage engines.
