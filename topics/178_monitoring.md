# Monitoring

> **Category:** Observability

---

Monitoring is the operational process of **continuously collecting, aggregating, and analyzing system health data (logs, metrics, traces)** to measure system stability against Service Level Objectives (SLOs) and detect system failures proactively.

### Telemetry Pipeline Architecture

Monitoring integrates the three pillars of observability into unified dashboarding and automated alerting engines.

```
+----------------------------------------------------------------------------------------------------+
| Telemetry Ingestion Layer                                                                          |
|                                                                                                    |
|  [ Metrics (Prometheus) ]      [ Logs (Elasticsearch/Loki) ]      [ Traces (Jaeger/Tempo) ]        |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| Central Monitoring Engine (Grafana / Datadog)                                                      |
|                                                                                                    |
|  - Aggregates Time-Series Graphs                                                                   |
|  - Evaluates SLO / SLA Threshold Compliance                                                         |
|  - Evaluates Alerting Rules Engine                                                                 |
+----------------------------------------------------------------------------------------------------+
                                                  |
                 +--------------------------------+--------------------------------+
                 v                                                                 v
+------------------------------------+                           +------------------------------------+
| Visual Dashboards                  |                           | Automated Alerting System          |
| (Real-time P99 Latency & Status)   |                           | (PagerDuty / OpsGenie / Slack)     |
+------------------------------------+                           +------------------------------------+
```

### SLA vs SLO vs SLI Reference Matrix

| Term | Full Name | Definition | Example Value |
| :--- | :--- | :--- | :--- |
| **SLI** | Service Level Indicator | A specific quantitative metric measuring service performance | Successful HTTP response rate |
| **SLO** | Service Level Objective | Target goal set for an SLI by internal engineering teams | 99.9% of successful responses over 30 days |
| **SLA** | Service Level Agreement | Business contract with external clients incurring financial penalties if breached | 99.5% monthly uptime guarantee or issue billing credit |

### The Three Pillars of Observability

1. **Metrics**: Numeric aggregations over time. Best for high-level alerting, trends, and dashboard graphs.
2. **Logs**: Detailed discrete textual events. Best for deep debugging and root cause investigation.
3. **Traces**: Request propagation paths. Best for latency analysis across distributed microservices.

### Key Trade-offs & Production Considerations

- ✅ **Proactive Incident Management**: Detects system degradation before it escalates into customer outages.
- ❌ **Alert Fatigue**: Poorly tuned monitoring systems trigger hundreds of non-actionable notifications, causing operators to ignore real emergencies.
### PromQL SLO Error Budget Calculation Example

```promql
# 30-Day Availability SLI (Percentage of non-5xx requests)
(
  sum(rate(http_requests_total{status!~"5.."}[30d]))
  /
  sum(rate(http_requests_total[30d]))
) * 100

# Error Budget Burn Rate (Alert if 1-hour error rate > 14x 30-day budget)
(
  sum(rate(http_requests_total{status=~"5.."}[1h]))
  /
  sum(rate(http_requests_total[1h]))
) > (1 - 0.999) * 14
```

### Key takeaway

Effective monitoring measures quantitative **Service Level Indicators (SLIs) against target Service Level Objectives (SLOs)**, uniting metrics, logs, and traces into actionable operational insight.
