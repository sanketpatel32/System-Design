# Design ETL System

> **Category:** Analytics and Data Pipelines

---

An Extract, Transform, Load (ETL) system automates the ingestion of raw data from multiple operational databases, transforms it into structured analytical formats, and loads it into enterprise data warehouses.

### System Requirements
- **Functional Requirements**:
  - Extract data efficiently using Change Data Capture (CDC) or scheduled batch queries.
  - Transform data (cleaning, deduplication, schema normalization, data masking).
  - Load transformed data into analytical warehouses with robust error management (Dead-Letter Queues).
- **Non-Functional Requirements**:
  - High Reliability: Idempotent DAG pipeline execution with retry capabilities.
  - Data Lineage: Track complete data origins and transformation histories.
  - Low Operational Cost: Efficient resource allocation during ETL batch execution windows.

### System Architecture
```
[ Operational DBs ] ---> [ Change Data Capture (Debezium) ] ---> [ Raw Data Buffer (S3) ]
                                                                        |
                                                                        v
[ DAG Orchestrator ] ----------------------------------------> [ ETL Processing Engine ]
(Airflow / Prefect)                                             (Apache Spark / dbt)
                                                                        |
                                  +-------------------------------------+-------------------------------------+
                                  |                                                                           |
                                  v                                                                           v
                      [ Data Warehouse (Snowflake) ]                                              [ Dead-Letter Queue (DLQ) ]
                      (Transformed Clean Tables)                                                  (Malformed Records / Alerts)
```

### ETL vs ELT Comparison
| Paradigm | Transformation Location | Best Use Case | Performance & Flexibility |
|---|---|---|---|
| **ETL (Extract-Transform-Load)** | External compute engine (Spark) before loading | Strict privacy compliance, heavy data cleaning before warehouse ingest | Reduces warehouse storage costs; transformation engine requires maintenance. |
| **ELT (Extract-Load-Transform)** | Transformed inside Data Warehouse via SQL (`dbt`) | Modern cloud data warehouses (Snowflake, BigQuery) | Maximum flexibility; allows analysts to re-transform raw historical data in SQL easily. |

### Key takeaway
ETL systems decouple DAG orchestration (Airflow) from heavy data transformations (Spark/dbt), while modern cloud architectures increasingly shift toward ELT to leverage scalable cloud warehouse SQL engines.
