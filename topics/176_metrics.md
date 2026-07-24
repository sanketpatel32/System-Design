# Metrics

> **Category:** Observability

---

Metrics are **numeric, aggregated data points measured over time intervals**, providing quantitative visibility into overall system health, resource utilization, and operational performance.

### Prometheus Pull Metrics Architecture

```
+-----------------------------------------------------------------------------------+
|                         App Pods (Exposing /metrics Endpoint)                     |
+-----------------------------------------------------------------------------------+
                                          ^
                                          | 1. HTTP Pull / Scraping (Every 15s)
                                          v
+-----------------------------------------------------------------------------------+
|                         Prometheus Server Time-Series DB                          |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                | 2. PromQL Queries                                 | 3. Alert Triggers
                v                                                   v
+------------------------------------+                    +------------------------------------+
| Grafana Visualization Dashboard    |                    | Alertmanager (PagerDuty / Slack)   |
+------------------------------------+                    +------------------------------------+
```

### The Four Golden Signals of Monitoring

| Metric Signal | Definition | Example Units |
| :--- | :--- | :--- |
| **Latency** | Time taken to service a request (split by 50th/99th percentile)| Milliseconds (ms) |
| **Traffic** | Total demand placed on the system | Requests per second (QPS) |
| **Errors** | Rate of requests that fail | HTTP 5xx count / percentage |
| **Saturation** | How full system resources are | CPU %, Memory RAM %, IOPS |

### Metric Data Types

- **Counter**: Monotonically increasing value (e.g. `http_requests_total`).
- **Gauge**: Instantaneous numerical snapshot that goes up or down (e.g. `memory_usage_bytes`).
- **Histogram**: Samples observations into configurable buckets for percentile calculations (e.g. `http_request_duration_seconds_bucket`).

### Key takeaway

Track system health using the **Four Golden Signals (Latency, Traffic, Errors, Saturation)** stored as time-series metrics for fast aggregation and alerting.
