# Design Analytics Platform

> **Category:** Data Intensive Systems

---

Design a system to ingest, store, and analyze event data (product analytics, like Mixpanel).

### Requirements
- **Functional**: ingest events; query (funnels, retention); dashboards.
- **Non-functional**: high write throughput; sub-second queries.

### Architecture
```
[Apps] -> [Collector] -> [Kafka] -> [Stream processor] -> [Warehouse]
                                              |
                                              v
                                         [Real-time DB (ClickHouse)]
                                              |
                                              v
                                         [Dashboard API]
```

### Ingestion
- SDK in app sends events.
- Collector batches, validates.
- Kafka buffers.

### Storage
- **Columnar** (ClickHouse, BigQuery, Redshift): fast aggregations.
- **Time-based partitions**: drop old easily.

### Query
- Funnels (sequence of events).
- Retention (cohort analysis).
- Aggregations (counts, sums).

### Real-time
- Stream processor (Flink) computes live metrics.

### Key takeaway
Analytics platform = event ingestion (Kafka) → columnar warehouse (ClickHouse/BigQuery) →
dashboard API. Columnar stores give 10-100x faster aggregations than row stores.
