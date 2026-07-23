# Design Data Lake

> **Category:** Data Intensive Systems

---

Design a data lake: store raw data at massive scale for later analysis.

### Requirements
- **Functional**: ingest any data (structured, semi-, un-); query when needed.
- **Non-functional**: petabyte scale; cheap storage.

### Architecture
```
[Sources] -> [Ingest] -> [S3 (raw zone)]
                          [Processed zone (Parquet)]
                          [Curated zone (warehouses)]
```

### Zones
- **Raw**: as-is from source.
- **Processed**: cleaned, conformed (Parquet).
- **Curated**: business-level aggregations.

### Storage
- **S3 / GCS / Azure Blob**: cheap, durable.
- **Parquet / ORC**: columnar, compressed.

### Query
- ** Athena / BigQuery / Snowflake**: query data lake directly.
- **Trino / Presto**: distributed SQL over lake.

### Schema-on-read
- Define schema when querying, not when storing.
- Flexible; accommodates changes.

### Lakehouse
- Combine lake + warehouse.
- ACID transactions on lake (Delta Lake, Iceberg, Hudi).

### Key takeaway
Data lake = S3/GCS + Parquet + query engine (Athena/Trino). Zones: raw → processed → curated.
Modern lakehouse (Delta/Iceberg) adds ACID + schema enforcement.
