# Design Metrics Collection System

> **Category:** Data Intensive Systems

---

Design a system to collect metrics from all services (like Prometheus + Datadog).

### Requirements
- **Functional**: collect; aggregate; alert; visualize.
- **Non-functional**: high write throughput; queryable.

### Architecture
```
[Services] expose /metrics -> [Scraper (Prometheus)]
                                 |
                                 v
                            [TSDB (Prometheus)]
                                 |
                                 v
                            [Alertmanager] -> [PagerDuty]
                            [Grafana]
```

### Pull model (Prometheus)
- Scraper fetches `/metrics` every N seconds.
- Pros: simple, no app changes for push.
- Cons: services must be reachable.

### Push model (StatsD, CloudWatch)
- App pushes metrics.
- Pros: works behind NAT.
- Cons: more app code.

### TSDB
- Time-series optimized.
- Compresses well (delta encoding).
- Columns: metric name, labels, timestamp, value.

### Cardinality
- High cardinality (per-user labels) explodes storage.
- Keep labels bounded.

### Alerting
- Threshold rules (`error_rate > 0.01 for 5m`).
- Alertmanager routes to PagerDuty/Slack.

### Key takeaway
Metrics collection = pull (Prometheus) or push (StatsD) → TSDB → alerting + Grafana dashboards.
Watch cardinality. Most modern stacks use Prometheus + Grafana.
