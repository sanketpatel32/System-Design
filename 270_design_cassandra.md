# Design Cassandra

> **Category:** Advanced System Design Problems

---

Design Cassandra: wide-column distributed DB.

### Requirements
- **Functional**: writes at massive scale; tunable consistency.
- **Non-functional**: always writable; multi-datacenter.

### Architecture
- **Peer-to-peer** (no leader).
- **Consistent hashing** + vnodes for partitioning.
- **Replication** across N nodes (RF).
- **Gossip** for membership.
- **SSTables + memtable** (LSM tree) for storage.

### Data model
- **Keyspace** → **table** (column family) → **partition** → **rows**.
- Primary key = partition key + clustering columns.
- Wide rows: many clustering keys per partition.

### Writes
- Append to commit log + memtable.
- Memtable flushes to SSTable (immutable).
- Compaction merges SSTables.

### Reads
- Memtable → SSTables (with bloom filters + index).
- Read repair fixes stale replicas.

### Tunable consistency
- ONE, QUORUM, ALL per query.
- (R + W > RF) for strong.

### Multi-datacenter
- Replication strategy per DC.
- Rack-aware.

### Key takeaway
Cassandra = peer-to-peer + LSM storage (memtable + SSTable) + consistent hashing + tunable
consistency. Always writable, multi-DC. Optimized for writes. No joins, limited transactions.
