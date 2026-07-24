# Design Distributed Logging System

> **Category:** Analytics and Data Pipelines

---

A Distributed Logging System aggregates, indexes, stores, and searches log streams from thousands of distributed application microservices and server nodes in centralized repositories.

### System Requirements
- **Functional Requirements**:
  - Collect structured (JSON) and unstructured log streams from containers and bare-metal nodes.
  - Parse, enrich, and index log fields (trace IDs, log levels, timestamps).
  - High-performance search and filtering UI (e.g. Kibana / Grafana Loki).
- **Non-Functional Requirements**:
  - High Throughput: Process hundreds of gigabytes/terabytes of log data daily.
  - Low Ingestion Overhead: Minimal CPU and memory consumption by edge log agents.
  - Configurable Retention: Cost-effective storage tiering (hot indexing vs cold S3 storage).

### System Architecture
```
[ Application Pods ] ---> [ Log Collectors (Fluentbit / Vector) ]
                                          |
                                          v
                              [ Distributed Queue (Kafka) ]
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
[ Elasticsearch / OpenSearch ]                                      [ Grafana Loki / S3 Storage ]
(Full-Text Inverted Index - Hot Tier)                              (Label-Indexed Chunk Storage - Cold Tier)
```

### Log Storage Engine Trade-offs
| Storage Engine | Indexing Model | Query Speed | Storage Cost |
|---|---|---|---|
| **Elasticsearch** | Inverted Index on all fields | Sub-second full-text search | High (large disk index footprint). |
| **Grafana Loki** | Indexes only labels/metadata | Fast for targeted streams; slower full-text scanning | Low (stores compressed log chunks directly in S3). |
| **ClickHouse** | Columnar storage with primary key skipping | Extremely fast structured aggregations | Moderate to low. |

### Key takeaway
Distributed logging balances search speed against storage cost by decoupling log collection agents (Vector/Fluentbit) from message buffers (Kafka) and utilizing multi-tier storage engines (Elasticsearch for hot indexing, Loki/S3 for cost-effective log storage).
