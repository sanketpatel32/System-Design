# Metrics

> **Category:** Observability

---

Metrics = **numeric measurements of system behavior over time.** The foundation of
monitoring and alerting.

### Why metrics
- **Understand** what's happening.
- **Detect** anomalies.
- **Alert** when things break.
- **Trend** analysis (capacity planning).
- **SLO/SLA tracking**.

### Types
- **Counter**: monotonically increasing (requests served, errors).
- **Gauge**: instantaneous value (CPU, queue depth).
- **Histogram**: distribution (request latency buckets).
- **Summary**: pre-computed quantiles.

### USE method (resources)
For resources (CPU, disk, network):
- **U**tilization (% busy).
- **S**aturation (queue length).
- **E**rrors (failed operations).

### RED method (services)
For services:
- **R**ate (requests/sec).
- **E**rrors (error rate).
- **D**uration (latency distribution).

### Four Golden Signals (Google SRE)
- **Latency**.
- **Traffic**.
- **Errors**.
- **Saturation**.

### Cardinality
- Each unique label combination = a time series.
- High cardinality (per-user, per-request) → explosion.
- Keep cardinality bounded.

### Collection
- **Pull model** (Prometheus): scrape metrics endpoints.
- **Push model** (StatsD, CloudWatch): app pushes.
- **OTS**: OpenTelemetry standard.

### Storage
- Time-series DB (TSDB): Prometheus, InfluxDB, TimescaleDB.
- Compresses well (columnar, delta).
- Retention: 15 days (Prometheus default), longer with remote storage.

### Visualization
- Grafana dashboards.
- Per-service dashboards.
- SLO dashboards.

### Key takeaway
Use the **RED method** for services (Rate, Errors, Duration) and **USE** for resources
(Utilization, Saturation, Errors). Use Prometheus + Grafana. Watch cardinality. Tie alerts to
user-facing SLOs, not raw metrics.
