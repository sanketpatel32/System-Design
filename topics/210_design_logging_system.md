# Design Logging System
> **Category:** Beginner System Design Problems

---

### Overview
A **Logging System** (e.g., ELK Stack, Grafana Loki) ingests, buffers, indexes, and queries high-volume unstructured log streams emitted by microservices across distributed infrastructure.

### End-to-End Log Ingestion & Indexing Pipeline

```
+--------------------------------------------------------------------------+
| Producer Layer: App Containers -> Write stdout/stderr                     |
| FluentBit / Vector DaemonSet agent reads local log files                 |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Buffer High-Throughput Stream
+--------------------------------------------------------------------------+
| Ingestion Buffer: Apache Kafka / Redpanda Cluster                        |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Parse & Index
+--------------------------------------------------------------------------+
| Processing & Storage: Logstash Consumers -> OpenSearch / Grafana Loki    |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Query
+--------------------------------------------------------------------------+
| Visualization: Grafana / Kibana Dashboards                               |
+--------------------------------------------------------------------------+
```

### Logging Architecture Comparison: Full Text Index vs Label Index

| Architecture | Storage Engine | Indexing Model | Pros | Cons |
|---|---|---|---|---|
| **Elasticsearch / OpenSearch** | Lucene Inverted Index | Indexes every token in log payload | Fast arbitrary full-text keyword search | High storage & CPU indexing overhead |
| **Grafana Loki** | Chunk Store (S3) + Index | Indexes only stream labels (e.g., `app=order-service`) | Low storage footprint (~90% cheaper); uses S3 | Slower full-text grep scans across raw chunks |

### Log Data Retention Tier Matrix

| Storage Tier | Storage Media | Retention Period | Query Latency Target |
|---|---|---|---|
| **Hot Tier** | High-performance NVMe SSDs | 1 - 7 Days | Sub-second real-time dashboard searches |
| **Warm Tier** | Standard SATA SSD / HDD | 8 - 30 Days | 1 - 5 seconds |
| **Cold / Archive Tier**| AWS S3 Standard-IA / Glacier | 31 Days - 7 Years | Minutes to Hours (Batch audit extraction) |

### Key takeaway
Buffer high-throughput log streams using **Apache Kafka**. Use **Grafana Loki** (label indexing + S3 chunk storage) to achieve 90% cost savings over full-text indexed engines like Elasticsearch for standard log retention.
