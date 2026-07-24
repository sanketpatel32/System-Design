# Design Data Lake

> **Category:** Analytics and Data Pipelines

---

A Data Lake is a centralized storage repository that holds vast amounts of raw, semi-structured, and structured data in native formats until needed for processing and analytics.

### System Requirements
- **Functional Requirements**:
  - Ingest heterogeneous data sources (relational DBs, logs, IoT streams, media files).
  - Multi-tier data zone organization (Raw / Bronze, Cleansed / Silver, Curated / Gold).
  - Open table formats for ACID transactions, time travel, and schema evolution.
- **Non-Functional Requirements**:
  - High Durability & Availability: $99.999999999\%$ (11 9s) object durability via cloud stores (S3 / ADLS).
  - Extreme Scalability: Scale storage to exabytes independently of query compute resources.
  - Low Storage Cost: Utilize object storage tiering (Standard, Infrequent Access, Glacier).

### System Architecture
```
[ Data Sources ] ---> [ Data Ingestion (Kafka / Debezium) ]
                                     |
                                     v
                        [ Cloud Object Storage (S3) ]
  +----------------------------------+----------------------------------+
  |                                  |                                  |
  v                                  v                                  v
[ Raw / Bronze Zone ]     [ Cleansed / Silver Zone ]     [ Curated / Gold Zone ]
(Raw JSON / CSV Logs)     (Parquet + Iceberg ACID)      (Aggregated Analytics Tables)
  |                                  |                                  |
  +----------------------------------+----------------------------------+
                                     |
                                     v
                  [ Catalog & Metastore (Hive / AWS Glue) ]
                                     |
                                     v
                  [ Query Engines (Trino / Spark SQL) ]
```

### Open Table Formats Comparison
| Feature / Format | Apache Iceberg | Delta Lake | Apache Hudi |
|---|---|---|---|
| **Primary Focus** | General-purpose cloud data lakes | Spark integration & cloud warehouses | Stream ingestion & CDC upserts |
| **ACID Guarantees** | Snapshot isolation via metadata tree | ACID via JSON transaction log | Copy-on-Write / Merge-on-Read |
| **Engine Agnostic** | Excellent (Trino, Spark, Flink, Presto) | Strong (Databricks, Spark, Trino) | Good (Spark, Flink) |

### Key takeaway
A Data Lake architecture decouples cloud object storage from query compute, using multi-tier data refinement zones (Bronze/Silver/Gold) and open table formats (Apache Iceberg) to enable ACID transactions over object storage.
