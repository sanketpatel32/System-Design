# Design Cassandra

> **Category:** Distributed Systems Infrastructure

---

Apache Cassandra is an open-source, distributed Wide-Column NoSQL database designed to handle large amounts of data across commodity servers with no single point of failure.

### System Requirements
- **Functional Requirements**:
  - Wide-column store model keyed by Partition Key and Clustering Columns.
  - Tunable consistency levels (`ONE`, `QUORUM`, `ALL`) per query.
  - Linear horizontal write scaling.
- **Non-Functional Requirements**:
  - Masterless Peer-to-Peer Architecture: No master node; all nodes perform identical roles.
  - High Write Throughput: Append-only write path optimizing disk throughput.
  - Continuous Availability: Zero downtime during node additions or hardware failures.

### System Architecture & Internal Write/Read Paths
```
                           [ Peer-to-Peer Ring (Gossip Protocol) ]
                                            |
                                            v
                                 [ Target Storage Node ]
  +-----------------------------------------+-----------------------------------------+
  | Write Path                              | Read Path                               |
  v                                         v                                         v
[ CommitLog (Disk Sequential) ]   [ Memtable (RAM) ]   [ Bloom Filter ] -> [ Partition Key Cache ]
  |                                 |                                            |
  +--------------------+------------+                                            v
                       |                                              [ SSTables (Disk Data) ]
                       v
            [ SSTables (Disk Compaction) ]
```

### Write Path vs Read Path Execution
| Operation | Sequence of Internal Execution | Performance Characteristics |
|---|---|---|
| **Write Path** | Write to **CommitLog** (sequential disk) → Write to **Memtable** (in-memory) → Flush to **SSTable** (immutable disk file). | Ultra-fast (< 2 ms); avoids random disk writes. |
| **Read Path** | Check **Memtable** → Check **Bloom Filter** → Check **Key Cache** → Scan **Partition Summary/Index** → Read **SSTable**. | Slower than write path; requires Bloom filter checks across multiple SSTables. |

### SSTable Compaction Strategies
- **Size-Tiered Compaction Strategy (STCS)**: Merges SSTables of similar sizes. Optimal for heavy write workloads.
- **Leveled Compaction Strategy (LCS)**: Organizes SSTables into fixed-size levels (10MB). Optimal for heavy read workloads.
- **Time-Window Compaction Strategy (TWCS)**: Groups SSTables based on time windows. Optimal for time-series data.

### Key takeaway
Cassandra's masterless peer-to-peer ring delivers high write throughput by appending writes to sequential CommitLogs and Memtables before flushing to immutable SSTables, using Bloom filters and compaction strategies to optimize reads.
