# Design Elasticsearch

> **Category:** Advanced System Design Problems

---

Design Elasticsearch: distributed search engine (built on Lucene).

### Requirements
- **Functional**: full-text search; aggregations; near-real-time indexing.
- **Non-functional**: sub-second queries; HA.

### Architecture
```
[Client] -> [Coordinator node]
              |
              v
           [Primary shards] -replicate-> [Replica shards]
```

### Index = collection of shards
- **Primary shards**: original data.
- **Replica shards**: HA + read scale.
- Each shard = a Lucene index.

### Lucene
- **Inverted index**: word → documents.
- **Segments**: immutable, merged over time.
- **Analyzer**: tokenizes text.

### Writes
- Document → primary shard → replica shards.
- Refresh (1s default) → searchable.

### Reads
- Coordinator fans out to all shards.
- Merges results.

### Aggregations
- Per-shard compute → merge.
- Fast on columnar doc-values.

### Cluster management
- Master node (elected).
- Cluster state via gossip.

### Key takeaway
Elasticsearch = sharded Lucene indices + replicas + inverted index for search. Writes near-real-
time (1s refresh). Aggregations on doc-values. Master coordinates cluster state.
