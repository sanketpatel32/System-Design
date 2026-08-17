# Design Metrics Collection System

> **Category:** Analytics and Data Pipelines

---

A Metrics Collection and Monitoring System gathers, indexes, and visualizes system infrastructure metrics (CPU, memory, request rates, error counts) across thousands of servers and microservices.

### System Requirements
- **Functional Requirements**:
  - Collect time-series metrics from application services and infrastructure hosts.
  - Support counter, gauge, histogram, and summary metric types with rich key-value tags.
  - Real-time alerting engine based on metric thresholds and anomaly detection.
- **Non-Functional Requirements**:
  - High Ingestion Bandwidth: Ingest millions of data points per second smoothly.
  - Efficient Compression: Time-series delta-of-delta and XOR compression for timestamps/values.
  - High Availability: Operational stability during infrastructure outages.

### System Architecture
```
[ App Hosts / Pods ] ---> [ OpenTelemetry Agent ] ---> [ Metrics Ingestion Pipeline ]
                                                                  |
                             +------------------------------------+------------------------------------+
                             |                                                                         |
                             v                                                                         v
                 [ Alerting Engine (PromQL) ]                                              [ Time-Series Database (TSDB) ]
                 (PagerDuty / Slack Hooks)                                                 (Prometheus / VictoriaMetrics)
                                                                                                       |
                                                                                                       v
                                                                                           [ Grafana Dashboard UI ]
```

### Metric Types & Timeseries Database Engines
| Metric Type | Description | TSDB Storage Choice | Pros & Cons |
|---|---|---|---|
| **Counter** | Monotonically increasing value (e.g. `http_requests_total`) | **Prometheus TSDB** | Highly optimized local TSDB; hard to scale horizontally without Thanos/Cortex. |
| **Gauge** | Value that goes up and down (e.g. `memory_usage_bytes`) | **VictoriaMetrics** | Extreme compression ratio; high horizontal scaling efficiency. |
| **Histogram** | Samples observations into configurable buckets | **TimescaleDB** | PostgreSQL extension; excellent SQL support but higher disk storage footprint. |

### Pull vs Pull (Collection Model)
| Model | Mechanism | Trade-offs |
| :--- | :--- | :--- |
| **Pull (Prometheus)** | Server scrapes `/metrics` on an interval. | Simple service discovery, natural liveness check; scrape interval caps resolution, targets behind NAT need exporters. |
| **Push (StatsD/OpenTelemetry)** | Agents push to a collector/gateway. | Sub-second resolution, works anywhere; must handle collector outages (buffer + retry or drop policy). |
| **Hybrid (OTel standard)** | Agents push to a local gateway that is scraped or forwards. | Best of both — the current industry default. |

### Cardinality: The Real Enemy
- **High-cardinality tags kill TSDBs**: a tag like `user_id` (millions of values) explodes the series count — each unique tag-value combination is its own stored time series, and queries/aggregations scan all of them.
- **Guardrails**: enforce allow-listed tags at the collector, reject new series above a per-service budget, and alert on series-count growth rate — the failure mode is slow agony (RAM, then query timeouts), not a crash.
- **Log-shaped data ≠ metrics**: unbounded identifiers belong in logs/traces, with metrics carrying only bounded dimensions (`route`, `status_class`, `region`).

### Alerting Pipeline Discipline
1. **Rule evaluation** (PromQL `FOR` clauses) must be windowed — firing on a single scrape's spike pages nobody at 3 a.m.
2. **Deduplication and grouping** at the alertmanager tier: one root cause (node down) should produce one page, not forty per-service alerts.
3. **Symptom-based alerts**: page on user-visible symptoms (error rate, latency) and ticket on causes (disk 85%) — inverse alerting burns on-call trust.
4. **Recording rules** precompute heavy aggregations so dashboards and alerts query cheap stored series instead of scanning raw data every evaluation.

### Key takeaway
Metrics collection systems rely on specialized Time-Series Databases (TSDB) using Gorilla timestamp/value compression and alerting evaluation engines to process high-velocity telemetry streams with low overhead.
