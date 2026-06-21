# Design Google Bigtable

> **Category:** Advanced System Design Problems

---

Design Bigtable: Google's wide-column distributed DB.

### Architecture
- **Tables** → **tablets** (range partitions).
- Each tablet served by one tablet server.
- Tablets balanced via Chubby (lock service).
- Storage: SSTables on Colossus (GFS successor).

### Data model
- **Row key** (sorted).
- **Column family** :**column qualifier**.
- **Cells** versioned (timestamps).

### Reads/writes
- Writes: WAL + memtable → SSTable.
- Reads: merge memtable + SSTables.
- Compaction merges SSTables.

### Sharding
- Row key ranges → tablets.
- Tablet split when too big.

### Use cases
- Time-series.
- Massive writes.
- Sparse data.

### vs Cassandra
- Bigtable: single row transactions, managed.
- Cassandra: tunable consistency, multi-DC.

### Key takeaway
Bigtable = tablets (range-sharded) + SSTables + memtable + Chubby for coordination. Row key
range queries fast. Optimized for massive write throughput + sparse wide rows.
