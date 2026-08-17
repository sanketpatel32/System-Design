# Design Elasticsearch

> **Category:** Advanced System Design Problems

---

Elasticsearch is a distributed, multitenant-capable full-text search engine based on Apache Lucene, offering real-time indexing, schema-free JSON document storage, and distributed analytics.

### System Requirements
- **Functional Requirements**:
  - Full-text search with relevance scoring (BM25), fuzzy matching, and highlighting.
  - Near-Real-Time (NRT) document indexing and real-time aggregations.
  - Multi-tenant index sharding and alias management.
- **Non-Functional Requirements**:
  - High Availability: Primary-replica shard failover across cluster nodes.
  - Scalability: Distribute billions of documents across horizontal shards.
  - Low Latency: Sub-100ms search execution across large indices.

### System Architecture
```
[ Client Requests ] ---> [ Coordinating Node ]
                                |
        +-----------------------+-----------------------+
        | (Scatter-Gather Phase)                        |
        v                                               v
[ Data Node 1 (Primary Shard 0) ]               [ Data Node 2 (Replica Shard 0) ]
(Lucene Index + Inverted Index)                 (Lucene Index + Inverted Index)
        |                                               |
        +-----------------------+-----------------------+
                                |
                                v
                     [ Cluster State Master Node ]
```

### Inverted Index Mechanics & Query Phases
```
Term Dictionary ---> Term Index (FST) ---> Posting List (Doc IDs + Positions)
```

| Query Phase | Execution Steps | Computational Focus |
|---|---|---|
| **1. Query Phase** | Coordinating node broadcasts request to all shards; each shard returns matching doc IDs + BM25 scores. | Scatter execution; sorting small ID arrays. |
| **2. Fetch Phase** | Coordinating node merges scores, requests full document payloads for top N IDs from owner shards. | Gather execution; payload transmission. |

### Near-Real-Time Indexing Path
A document is searchable only after refresh, not on write:

```
WRITE doc --> in-memory buffer + translog (durable) --> [refresh, default 1s]
          --> new Lucene segment (searchable)        --> [flush, ~30min]
          --> segments merged to disk + translog cleared
```

- **Translog**: every write hits a write-ahead log first, so a crashed node recovers un-flushed segments — durability survives the 1-second refresh gap.
- **Segment merging**: Lucene writes immutable segments and background-merges them; many small segments (heavy indexing) slow queries until merges catch up.
- **Refresh tuning**: raising `refresh_interval` (e.g., 30s for bulk indexing pipelines) dramatically improves write throughput at the cost of search freshness.

### Cluster Topology & Failure Behavior
| Concern | Mechanism |
|---|---|
| **Master election** | Dedicated master-eligible nodes (3 or 5) vote; the master owns cluster state (mapping, shard allocation). |
| **Node loss** | Replicas are promoted to primaries; the master re-replicates to restore the replica count on remaining nodes. |
| **Split brain** | A strict quorum of master-eligible nodes must exist for a new master — without quorum the minority side stops serving writes rather than diverging. |
| **Shard sizing** | Target 10–50 GB per shard; oversharding (hundreds of tiny shards) wastes heap on overhead per shard. |
| **Hot threads / GC** | Coordinating nodes doing heavy aggregations need their own heap headroom — data-node GC pauses surface as query jitter. |

### Practical Pitfalls
- **Deep pagination**: `from+size=10000` gathers that many results *per shard* — use `search_after` with a sort key for cursor-style paging.
- **Wildcard prefix queries** on unanalyzed keyword fields are full term-dictionary scans; model prefixes with `edge_ngram` analyzers instead.
- **Mapping explosions**: high-cardinality dynamic fields (user-generated keys) exhaust field-count limits — cap dynamic mapping and normalize labels at ingest.

### Key takeaway
Elasticsearch achieves fast full-text search by indexing JSON fields into Lucene inverted indices (FSTs) and utilizing scatter-gather query execution across primary and replica shards.
