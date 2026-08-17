# Choosing the Right Database

> **Category:** Databases

---

Selecting the right database management system requires evaluating system data access patterns, write/read throughput ratios, latency constraints, consistency requirements, and scaling dimensions. Modern system design relies on **Polyglot Persistence** — employing different specialized databases for different microservices based on domain needs.

### Decision matrix taxonomy

```
                             [ Data Engine Selection ]
                                         |
     +-------------------+---------------+---------------+-------------------+
     |                   |                               |                   |
 (Relational/ACID)  (Document/Flexible)              (High Write Log)    (Search/Graph)
     v                   v                               v                   v
 PostgreSQL          MongoDB                         Cassandra          Elasticsearch
 MySQL               DynamoDB                        TimescaleDB        Neo4j
```

### Database Category Decision Matrix

| Database Type | Primary Engine Examples | Core Strengths | Weaknesses | Ideal System Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| **Relational (RDBMS)** | PostgreSQL, MySQL | Strong ACID, complex SQL `JOIN`s, schema safety | Hard to scale writes horizontally | Finance, ERP, Order Processing, Users DB |
| **Document Store** | MongoDB, Couchbase | Flexible schema, JSON document mapping | Lacks cross-document ACID transactions | Content management, Catalogs, Profiles |
| **Key-Value** | Redis, DynamoDB | Sub-millisecond latency, extreme O(1) ops | Limited querying capabilities (Primary key only) | Caching, User sessions, Leaderboards |
| **Wide-Column** | Apache Cassandra, ScyllaDB | Linearly scalable writes, zero single points of failure | Complex query modeling; no JOINs | IoT telemetry, Event logs, Messaging |
| **Search Engine** | Elasticsearch, OpenSearch | Inverted index, full-text search, fuzzy matching | High memory overhead; eventual consistency | Product catalog search, Log analytics |
| **Time-Series** | TimescaleDB, InfluxDB | Optimized timestamp indexing, high compression | Unsuited for general transactional updates | Monitoring metrics, Financial tickers |
| **Graph** | Neo4j, AWS Neptune | Fast multi-hop edge traversal | Specialized query syntax; hard to partition | Social networks, Fraud detection |

### Decision flowchart checklist

1. *Does the workload require ACID guarantees across multi-entity operations?* -> Choose **RDBMS (PostgreSQL)**.
2. *Is read traffic composed of unstructured text search or fuzzy lookups?* -> Offload reads to **Elasticsearch**.
3. *Does write traffic consist of continuous sensor readings or timestamp metrics?* -> Choose **Time-Series (TimescaleDB)**.
4. *Do queries require traversing complex N-hop connections between entities?* -> Choose **Graph DB (Neo4j)**.

### Key takeaway

Evaluate database selection based on workload access patterns and scalability needs. Modern architectures adopt polyglot persistence, matching specialized database engines (RDBMS, Document, Key-Value, Search, Time-Series) to specific microservice requirements.
