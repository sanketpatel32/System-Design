# Alerting

> **Category:** Observability

---

Alerting is the automated mechanism that **notifies engineering teams when system performance metrics violate defined threshold criteria or SLO error budgets**. Effective alerting routes actionable notifications to on-call engineers while minimizing false positives and alert fatigue.

### Alerting Pipeline & Escalation Architecture

Alerting engines continuously evaluate time-series metrics against threshold rules, routing notifications to escalation systems like PagerDuty.

```
+----------------------------------------------------------------------------------------------------+
| Time-Series Metric Store (Prometheus / Datadog)                                                    |
+----------------------------------------------------------------------------------------------------+
                                                  |
                    1. Evaluates Alert Rule (`error_rate > 2% for 5 mins`)
                                                  v
+----------------------------------------------------------------------------------------------------+
| Alerting Rules Engine (Alertmanager)                                                               |
| - Deduplicates & Groups Identical Alerts                                                           |
| - Applies Silence Windows & Maintenance Filters                                                    |
+----------------------------------------------------------------------------------------------------+
                                                  |
                 +--------------------------------+--------------------------------+
                 | 2. High Severity (P1/P2)                                        | 3. Low Severity (P3/P4)
                 v                                                                 v
+------------------------------------+                           +------------------------------------+
| PagerDuty / OpsGenie               |                           | Slack Channel / Email              |
| (Triggers Phone Call / SMS On-Call)|                           | (Non-Urgent Ticket Creation)       |
+------------------------------------+                           +------------------------------------+
```

### Alert Severity Level Matrix

| Severity | Notification Channel | Response SLA | Target Condition | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **P1 - Critical** | Phone Call / SMS (PagerDuty)| Immediate (< 15 mins) | Core service down; total outage | Immediate engineering intervention |
| **P2 - High** | SMS / Push Notification | Prompt (< 30 mins) | Degraded performance; high error rate | Investigate and mitigate |
| **P3 - Moderate**| Slack Channel / Email | Same Business Day | Non-critical component failover | File ticket for maintenance |
| **P4 - Low** | Email Log | Next Sprint | Minor anomaly / storage 70% full | Informational tracking |

### Principles of High-Signal Alerting

1. **Alert on Symptoms, Not Causes**: Alert on customer impact (e.g. high HTTP 500 error rate or high latency) rather than internal causes (e.g. CPU at 85%).
2. **Make Alerts Actionable**: Every P1/P2 alert must link to a specific **Runbook** detailing exact troubleshooting steps. If an alert requires no action, it should not page an engineer.
3. **Burn-Rate Alerting (SLO Error Budget)**: Alert based on how quickly the SLO error budget is being consumed (e.g. alert if 2% of monthly error budget is burned in 1 hour).

### Key Trade-offs & Production Risks

- ✅ **Minimizes Outage Duration**: Reduces Mean Time to Detect (MTTD) and Mean Time to Resolve (MTTR).
- ❌ **Alert Fatigue**: Constant noisy, non-actionable pages desensitize engineers, causing real critical outages to be missed.
### Prometheus Alert Rule Definition Example (`alerts.yml`)

```yaml
groups:
  - name: api_alerts
    rules:
      - alert: HighHttp5xxErrorRate
        expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High HTTP 5xx error rate detected: {{ $value | printf \"%.2f\" }}%"
          runbook_url: "https://wiki.example.com/runbooks/high-5xx-errors"
```

### Key takeaway

Alert on **symptom-based customer impact and SLO error budget burn rates**, ensuring every paged alert is actionable and linked to a runbook.
