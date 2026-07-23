# Design Data Pipeline

> **Category:** Data Intensive Systems

---

Design a data pipeline: move data from sources to destinations with transformation.

### Requirements
- **Functional**: extract from sources; transform; load to warehouse.
- **Non-functional**: reliable; schedulable; observable.

### Architecture
```
[Sources (DBs, APIs, logs)]
        |
        v
   [Extractors] -> [Kafka] -> [Transformers] -> [Loaders] -> [Warehouse]
                                                                   |
                                                                   v
                                                              [Dashboards]
                                                              [ML models]
```

### Stages
- **Extract**: pull from DB (CDC), API, files.
- **Transform**: clean, enrich, aggregate.
- **Load**: write to warehouse.

### Tools
- **Airflow**: orchestrates DAGs.
- **dbt**: SQL transforms.
- **Kafka Connect**: source/sink connectors.
- **Spark / Flink**: large-scale transforms.

### Patterns
- **Batch**: hourly / daily runs.
- **Micro-batch**: every few minutes (Spark).
- **Streaming**: continuous (Flink).

### Quality
- Schema validation.
- Data tests (great_expectations).
- Reconciliation counts.

### Key takeaway
Data pipeline = extract → transform → load (ETL). Orchestrate with Airflow. Stream with Kafka +
Flink for real-time. Validate data quality. Modern: ELT with dbt transforms in the warehouse.
