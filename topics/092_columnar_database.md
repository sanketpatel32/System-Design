# Columnar Database

> **Category:** Databases

---

A columnar database stores data **by column, not by row**, making it dramatically faster for
analytics.

### Row vs column storage
```
Row store (Postgres/MySQL):
Row 1: | id=1 | name=alice | age=30 | city=NYC |
Row 2: | id=2 | name=bob   | age=25 | city=LA  |

Column store (BigQuery, Redshift):
id:    | 1 | 2 |
name:  | alice | bob |
age:   | 30 | 25 |
city:  | NYC | LA |
```

### Why columnar wins for analytics
- **SELECT AVG(age) FROM users** → only read the `age` column, not the whole row.
- Massive I/O reduction (often 10-100x faster).
- **Compression** — similar values cluster together → run-length encoding, delta encoding.
- **Vectorized execution** — process batches of values efficiently.

### Trade-offs
| | Row store | Column store |
|--|-----------|--------------|
| Best for | OLTP (point reads/writes) | OLAP (aggregations) |
| Single-row read | Fast | Slow (must assemble) |
| Single-row write | Fast | Slow |
| Aggregations | Slow | Fast |
| Compression | Modest | Excellent |

### Use cases
- **Data warehouses**: BigQuery, Redshift, Snowflake.
- **Analytics**: ClickHouse, Druid.
- **Time-series**: TimescaleDB hybrid, InfluxDB.

### OLTP vs OLAP
- **OLTP** (transactional): many small reads/writes, low latency. Use row store.
- **OLAP** (analytical): few huge queries over millions of rows. Use column store.

Modern systems often separate them: Postgres for OLTP, Snowflake/BigQuery for OLAP.

### When to use
- Analytics dashboards.
- Business intelligence.
- Data lakes / lakehouses.

### Key takeaway
Columnar databases are 10-100x faster for analytics but bad for OLTP. Use them for **OLAP /
dashboards / data warehousing**. Keep OLTP on a row-store DB. Many systems sync OLTP → columnar
via ETL.
