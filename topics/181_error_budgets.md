# Error Budgets
> **Category:** Observability

---

### Overview
An **Error Budget** is the quantitative threshold of tolerable unreliability or downtime that a service can incur over a specific time window (e.g., 30 days or quarterly) before innovation and feature development are halted in favor of reliability engineering. It bridges the natural friction between product development (moving fast and breaking things) and Site Reliability Engineering (SRE) / operations (maintaining 100% uptime).

By defining reliability as a budgeted resource rather than an absolute requirement of 100% perfection, engineering teams gain permission to move quickly, run canary deployments, and push experimental features until the error budget runs low.

### Mathematical Definition & Budget Calculation
The error budget is directly derived from the **Service Level Objective (SLO)**:

$$\text{Error Budget} = 100\% - \text{SLO}$$

For example, for a microservice with a **99.9%** availability SLO over a 30-day rolling window ($43,200$ minutes):
- **Allowed Failure Rate:** $100\% - 99.9\% = 0.1\%$
- **Allowed Downtime Window:** $43,200 \text{ min} \times 0.001 = 43.2 \text{ minutes}$ (or $2,592$ allowed failed requests per $2,592,000$ total requests at 100 RPS).

### Error Budget Architecture & Burn Tracking Topology

```
+-------------------+       HTTP Requests       +--------------------+
|  Incoming Client  | ------------------------> | API Gateway / L7   |
|  Traffic          |                           | Load Balancer      |
+-------------------+                           +--------------------+
                                                          |
                                                          | Telemetry / Metrics
                                                          v
+-------------------+     PromQL Query          +--------------------+
| SRE Alert Manager | <------------------------ | Prometheus / Thanos|
| & PagerDuty       |                           | Time-Series DB     |
+-------------------+                           +--------------------+
          |                                               |
          | Budget Exhausted / Burn Spikes                | Metric Ingestion
          v                                               v
+-------------------+                           +--------------------+
| CI/CD Pipeline    |                           | Error Budget Engine|
| (Freeze Releases) |                           | & Dashboard        |
+-------------------+                           +--------------------+
```

### Core Mechanics & Burn Rate Alerting
Burn rate measures how quickly a service consumes its error budget. A burn rate of $1.0$ means the error budget will be completely exhausted exactly at the end of the SLO window (e.g., 30 days).

$$\text{Burn Rate} = \frac{\text{Observed Error Rate}}{100\% - \text{SLO}}$$

| Burn Rate | Budget Consumed | Time to Exhaustion (30-day window) | Alert Severity | Action Required |
|---|---|---|---|---|
| **1.0x** | 100% in 30 days | 720 hours | Informational | Monitor via daily dashboards; no immediate page. |
| **2.0x** | 100% in 15 days | 360 hours | Low Warning | Create low-priority Jira ticket for reliability sprint. |
| **14.4x** | 2.0% in 1 hour | 50 hours | PagerAlert (Slow Burn) | On-call engineer investigates within 1 hour. |
| **60.0x** | 5.0% in 1 hour | 12 hours | Critical Page (Fast Burn) | Immediate on-call escalation & freeze CI/CD deployments. |

### Observability Metrics & Telemetry API

| Metric Name / Endpoint | Type | Description | PromQL / Request Example |
|---|---|---|---|
| `http_requests_total` | Counter | Total incoming HTTP requests partitioned by status code. | `sum(rate(http_requests_total[5m]))` |
| `http_requests_errors_total` | Counter | Total HTTP 5xx server error responses. | `sum(rate(http_requests_total{status=~"5.."}[5m]))` |
| `error_budget_burn_rate` | Gauge | Calculated error budget burn rate over sliding window. | `(error_rate_5m) / (1 - 0.999)` |
| `GET /api/v1/reliability/budget` | API | Returns current error budget status and remaining balance. | Response: `{"slo": 99.9, "budget_remaining_pct": 42.5, "status": "ACTIVE"}` |

### Error Budget Schema & Storage Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `service_id` | String / UUID | Relational DB / Redis | Identifies the target microservice owner. |
| `slo_target` | Double (e.g., 0.999) | Relational DB | Targeted availability or latency threshold. |
| `window_days` | Integer (e.g., 30) | Relational DB | Rolling window duration for budget consumption. |
| `consumed_budget_pct` | Float | Redis Cache / TSDB | Real-time percentage of error budget spent in window. |
| `freeze_policy_active` | Boolean | Redis Cache | Flag checked by CI/CD pipeline to block feature deployments. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Rolling Window Budget (e.g., 30-day)** | Smooths out sudden historical spikes as time moves forward; prevents start-of-month artificial resets. | Complex PromQL queries; requires high-cardinality historical TSDB data. | Production microservices requiring continuous deployment pipelines. |
| **Calendar Window Budget (Monthly/Quarterly)** | Simple to communicate to business executives; clean alignment with quarterly OKRs. | Encourages risky deployments at start of window and extreme risk aversion at end of month. | Enterprise legacy systems with scheduled release cycles. |
| **Hard Automated Deployment Freeze** | Eliminates human bias; guarantees outage recovery focus. | Can block urgent business feature rollouts during competitive launches. | Mission-critical Tier-0 core services (Payment, Auth). |

### Key takeaway
An **Error Budget** turns reliability from an abstract philosophical goal into a quantitative, consumable engineering resource. It balances feature velocity against system stability by permitting calculated risk-taking when budget is abundant and enforcing deployment freezes when budget is depleted.
