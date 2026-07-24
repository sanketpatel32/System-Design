# Alerting

> **Category:** Observability

---

Alerting automatically **notifies engineering teams of system anomalies or SLA breaches**, routing actionable warnings via channels such as PagerDuty, Slack, or email.

### Alerting Pipeline & Notification Routing

```
+------------------------+      1. Metric Breach      +------------------------+
| Prometheus Alert Rules | -------------------------> | Alertmanager           |
+------------------------+                            +------------------------+
                                                                  |
                                                                  v 2. Group, Dedupe & Silence
                                                      +------------------------+
                                                      | Notification Router    |
                                                      +------------------------+
                                                                  |
                                     +----------------------------+----------------------------+
                                     | High Severity (P1)                                      | Low Severity (P3)
                                     v                                                         v
                         +------------------------+                                +------------------------+
                         | PagerDuty (On-Call Call)|                                | Slack / Teams Channel  |
                         +------------------------+                                +------------------------+
```

### Alert Severity Levels Matrix

| Severity Level | Trigger Condition | Reaction Requirement | Notification Channel |
| :--- | :--- | :--- | :--- |
| **P1 - Critical** | Core user functionality down / High error rate | Immediate wake-up response (< 15 mins) | PagerDuty / Phone Call |
| **P2 - Warning** | Component degraded, but fallback working | Address within business hours | Slack Priority Channel |
| **P3 - Informational**| Non-critical anomaly (e.g. disk at 75%) | Review during backlog grooming | Slack Async Channel |

### Preventing Alert Fatigue

- **Alert on Symptoms, Not Causes**: Alert on high user-facing error rates (Symptom) rather than single-server high CPU (Cause).
- **Service Level Objectives (SLO) Burn Rate Alerting**: Trigger alerts based on how fast the system is consuming its error budget rather than static arbitrary thresholds.

### Key takeaway

Design alerting to **notify on actionable user-facing symptoms**, leveraging SLO error budget burn rates to eliminate alert fatigue.
