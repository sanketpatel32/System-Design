# Design Google Bigtable

> **Category:** Advanced System Design Problems

---

Google Bigtable is a sparse, distributed, persistent multidimensional sorted map indexed by row key, column key, and timestamp.

### System Requirements
- **Functional Requirements**:
  - Dynamic multidimensional map lookup: `(row:string, column:string, time:int64) -> string`.
  - Sequential scan over sorted row key ranges.
  - Automatic range-based partitioning (Tablets).
- **Non-Functional Requirements**:
  - High Availability & Scalability: Scale throughput linearly by adding Tablet Servers.
  - Low Latency: Single-digit millisecond reads and writes on massive datasets.
  - High Durability: Backed by distributed file systems (Colossus / GFS).

### System Architecture
```
[ Bigtable Master Node ] ---> [ Chubby Distributed Lock Service ]
                                              |
     +----------------------------------------+----------------------------------------+
     |                                                                                 |
     v                                                                                 v
[ Tablet Server 1 ]                                                           [ Tablet Server 2 ]
(Serves Tablet Range: A - M)                                                  (Serves Tablet Range: N - Z)
  | (SSTables + Memtable)                                                       | (SSTables + Memtable)
  +----------------------------------------+------------------------------------+
                                           |
                                           v
                              [ Shared Storage (Colossus/GFS) ]
```

### Data Model & System Components
Data Model: (RowKey, ColumnFamily:Qualifier, Timestamp) \longr→ Cell Value

| Component | Technical Role | Fault Tolerance Mechanism |
|---|---|---|
| **Bigtable Master** | Assigns tablets to Tablet Servers, detects node joins/leaves | Stateless metadata coordinator; failover handled by Chubby election. |
| **Tablet Server** | Manages read/write traffic for a set of tablets (100-200 MB partitions) | If server dies, Master reassigns tablet range to another server. |
| **Chubby Lock** | Leader election, tablet location discovery, schema management | Paxos-based distributed lock service. |
| **Colossus / GFS** | Stores immutable SSTable files and commit logs | Multi-replica distributed object storage. |

### Key takeaway
Google Bigtable models data as a sorted sparse multidimensional map, decoupling stateless Tablet Servers from persistent Colossus SSTable files to enable sub-10ms performance and fast tablet reassignment.
