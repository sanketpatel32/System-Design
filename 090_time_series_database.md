# Time Series Database

> **Category:** Databases

---

A time-series database (TSDB) is optimized for **data indexed by time**: metrics, sensors,
stock prices, server logs.

### Characteristics
- **Append-mostly** — rarely update or delete.
- **Time-ordered** — queries always filter by time range.
- **High write volume** — millions of points/sec.
- **Downsampling** — old data aggregated (per-minute → per-hour).
- **Time-based retention** — auto-expire old data.

### Use cases
- Monitoring (Prometheus, Datadog).
- IoT sensor data.
- Application / business metrics.
- Financial market data.
- APM (traces, spans).

### Specialized TSDBs
| DB | Notes |
|----|-------|
| **InfluxDB** | Purpose-built, popular |
| **Prometheus** | Pull-based, metrics, K8s native |
| **TimescaleDB** | Postgres extension, SQL |
| **OpenTSDB** | HBase-backed, very large scale |
| **ClickHouse** | Columnar, very fast analytics |
| **Druid** | Real-time analytics |

### Why a TSDB beats Postgres/MySQL for time-series
- **Compression**: columnar + delta-encoding → 10-100x smaller.
- **Ingestion**: optimized for high write rates.
- **Queries**: time-bucket aggregations fast.
- **Retention**: built-in TTL and downsampling.

### Schema pattern
```
metric_name | tags (key=value pairs) | timestamp | value
cpu_usage   | host=web1, region=us   | 1700000000 | 75.3
```

### Downsampling
Raw data: 1 point/sec.
After 7 days: aggregate to 1 point/min.
After 30 days: aggregate to 1 point/hour.
After 1 year: aggregate to 1 point/day.

Reduces storage 1000x while keeping trends.

### Key takeaway
Use a TSDB when your data is **append-only, time-indexed, high-volume**. They give 10-100x
better compression and query performance than relational DBs for metrics. Don't use them as a
general-purpose DB.
