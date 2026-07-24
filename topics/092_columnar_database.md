# Columnar Database

> **Category:** Databases

---

A **Columnar Database** (or Column-Oriented DBMS) stores data on disk organized by column rather than by row. Columnar storage is optimized for Analytical Workloads (OLAP), enabling rapid aggregation over large datasets by reading only the specific columns requested in a query.

### Row-Oriented vs Column-Oriented Storage

```
Row-Oriented Storage (Postgres/MySQL - Best for OLTP)
+-----------------------------------------------------------------+
| Row 1: [ID1, Alice, 30, USA] | Row 2: [ID2, Bob, 25, UK]        |
+-----------------------------------------------------------------+

Column-Oriented Storage (ClickHouse/Snowflake - Best for OLAP)
+-----------------------------------------------------------------+
| Column IDs:     [ID1, ID2]                                      |
| Column Names:   [Alice, Bob]                                    |
| Column Ages:    [30, 25]                                        |
| Column Country: [USA, UK]                                       |
+-----------------------------------------------------------------+
```

### Core mechanics & analytics optimizations

1. **Column Elimination (I/O Efficiency)**: A query calculating average user age (`SELECT AVG(Age) FROM Users`) reads only the `Age` column data blocks from disk, skipping all other columns entirely.
2. **High Compression Ratios**: Storing identical data types contiguously enables compression algorithms (Run-Length Encoding, Dictionary Encoding, Bit-Packing) to achieve compression ratios up to 90%.
3. **Vectorized Query Execution**: Modern CPU architectures process column data arrays in parallel using SIMD (Single Instruction, Multiple Data) instructions.

### Row vs Column Store Matrix

| Dimension | Row-Oriented DBMS (OLTP) | Column-Oriented DBMS (OLAP) |
| :--- | :--- | :--- |
| **Primary Engines** | PostgreSQL, MySQL, Oracle | ClickHouse, Snowflake, AWS Redshift, BigQuery |
| **Write Pattern** | Fast single-row transactional `INSERT`/`UPDATE` | High-volume batch appends |
| **Read Pattern** | Single-record lookups fetching all columns | Aggregations (`SUM`, `AVG`) over millions of rows |
| **Storage Compression**| Low-Moderate | High (Contiguous uniform data types) |

### Key takeaway

Columnar databases optimize analytical (OLAP) queries by organizing storage around columns rather than rows. This minimizes disk I/O, maximizes compression, and enables high-speed aggregation over massive datasets.
