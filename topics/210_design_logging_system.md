# Design Logging System
> **Category:** Beginner System Design Problems

---

### Overview
A **Logging System** (e.g., ELK Stack - Elasticsearch/Logstash/Kibana, OpenSearch, ClickHouse, Grafana Loki) ingests, buffers, indexes, and queries high-velocity log streams emitted by thousands of microservice instances.

Systems process terabytes of structured JSON logs daily, demanding **decoupled asynchronous log aggregation**, backpressure buffer queues, columnar/inverted-index storage, and multi-tier retention lifecycle policies.

### Log Ingestion & Indexing Pipeline Topology

```
+--------------------------------------------------------------------------+
| APPLICATION MICROSERVICE PODS (Logs emitted to stdout / local log files) |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Local Log File Tailing
+--------------------------------------------------------------------------+
| LOG COLLECTOR AGENTS (Fluentbit / Vector / Logstash Sidecars)            |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. High-Throughput Batch Ingestion
+--------------------------------------------------------------------------+
| KAFKA LOG EVENT BUFFER (Decouples ingestion spikes from indexers)        |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Stream Consumption & Parsing
+--------------------------------------------------------------------------+
| LOG INDEXING & ANALYTICS ENGINE (OpenSearch / ClickHouse / Grafana Loki) |
+--------------------------------------------------------------------------+
                                     |
                                     v 4. Multi-Tier Lifecycle Storage
+--------------------------------------------------------------------------+
| STORAGE TIERS: Hot (SSD) --> Warm (HDD) --> Cold (AWS S3 Archival Blob)   |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Log Collector Sidecar Agents:** Lightweight agents (Fluentbit, Vector) tail stdout/log files, parse raw text into structured JSON, attach metadata (`pod_name`, `environment`, `trace_id`), and forward batches to Kafka.
2. **Kafka Ingestion Buffer:** Buffers massive log spikes (e.g., during major production outages) to prevent log indexers (OpenSearch/ClickHouse) from collapsing due to write overload.
3. **Storage Lifecycle Tiering:**
   - **Hot Tier (SSD):** High-speed indexing and sub-second searching for last 7 days of logs.
   - **Warm Tier (HDD):** Cost-effective search storage for days 8-30.
   - **Cold Tier (AWS S3):** Compressed raw archival storage for long-term compliance (1+ years).

### Log Ingestion API & Query Specifications

| Endpoint / Interface | Method | Request Payload | Purpose |
|---|---|---|---|
| `/api/v1/logs/ingest` | POST | `{"logs": [{"timestamp": 1700000000, "level": "ERROR", "service": "payment", "message": "DB Timeout"}]}` | High-throughput batch HTTP log ingestion. |
| `/api/v1/logs/search` | POST | `{"query": "service:payment AND level:ERROR", "timerange": "now-1h"}` | Executes search query over OpenSearch/ClickHouse index. |

### Structured Log Schema & Storage Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `@timestamp` | Date / Int64 | OpenSearch / ClickHouse | Timestamp of log event creation (Primary Index Key). |
| `trace_id` | String (Indexed) | OpenSearch / ClickHouse | Distributed tracing identifier linking logs across microservices. |
| `service_name` | String (Keyword) | OpenSearch / ClickHouse | Microservice emitting the log event. |
| `log_level` | String (Keyword) | OpenSearch / ClickHouse | Log severity level (`INFO`, `WARN`, `ERROR`, `FATAL`). |
| `message` | Text (Inverted Index)| OpenSearch | Full log message string parsed for full-text search. |
| `attributes` | JSONB / Map | OpenSearch | Arbitrary contextual key-value metadata fields. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **ClickHouse Columnar Storage vs OpenSearch**| 5x-10x higher compression ratio; sub-second aggregation speed over billions of rows. | Full-text substring search on unindexed raw message text is slower than OpenSearch. | High-volume structured log analytics systems. |
| **Grafana Loki (Label-Only Indexing)** | Low memory and storage footprint; indexes log labels only, storing raw text in S3. | Full-text query searching requires scanning raw unindexed logs. | Kubernetes microservice log aggregation. |
| **Kafka Buffer Layer** | Provides backpressure buffering during log volume spikes; prevents indexer crashes. | Introduces short ingestion latency delay before logs appear in search dashboard. | Enterprise logging pipelines handling terabytes daily. |

### Key takeaway
A **Logging System** handles massive log volumes by decoupling ingestion via **Fluentbit agents and Kafka buffer queues**, storing indexed logs across **Hot (SSD), Warm (HDD), and Cold (S3)** lifecycle tiers using **OpenSearch or ClickHouse**.
