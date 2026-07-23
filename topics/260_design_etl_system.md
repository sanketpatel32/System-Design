# Design ETL System

> **Category:** Data Intensive Systems

---

See **#259 Design Data Pipeline** — ETL is the canonical pattern.

### ETL vs ELT
- **ETL**: transform before loading (legacy, slower).
- **ELT**: load raw, transform in warehouse (modern, faster).

### Modern ELT
```
[Sources] -> [Extract] -> [Load raw to warehouse] -> [Transform (dbt)] -> [Models]
```

### Why ELT wins
- Warehouses (BigQuery, Snowflake) are fast enough to transform in-place.
- Raw data always available for re-modeling.
- dbt brings software engineering to SQL.

### Key takeaway
ETL/ELT = extract + load + transform. Modern = ELT with dbt. Raw data lands in warehouse, then
SQL transforms build models. Airflow orchestrates the schedules.
