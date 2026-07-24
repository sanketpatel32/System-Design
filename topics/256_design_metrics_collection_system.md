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

### Key takeaway
Metrics collection systems rely on specialized Time-Series Databases (TSDB) using Gorilla timestamp/value compression and alerting evaluation engines to process high-velocity telemetry streams with low overhead.
