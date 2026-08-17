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

### Key takeaway
Elasticsearch achieves fast full-text search by indexing JSON fields into Lucene inverted indices (FSTs) and utilizing scatter-gather query execution across primary and replica shards.
