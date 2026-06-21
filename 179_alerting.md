# Alerting

> **Category:** Observability

---

Alerting = **notifying humans when something needs attention.** The bridge between
monitoring and incident response.

### Why alert
- Detect issues before users complain.
- Trigger incident response.
- Wake someone up at 3am (only when truly needed).

### Alert principles

#### 1. Alert on symptoms, not causes
- ❌ "CPU > 80%"
- ✅ "Error rate > 1% for 5 min"
- Symptom = user-visible. Cause = might be fine.

#### 2. Actionable
- Each alert should require human action.
- If no action, it's noise.
- "Action or silence."

#### 3. Page vs ticket
- **Page** (wake someone): user-facing impact, urgent.
- **Ticket**: cleanup, follow-up, non-urgent.

#### 4. SLO-based
- Alert when error budget is burning too fast.
- Tied to user experience.

### Alert fatigue
- Too many alerts → ignored.
- Fix: tune thresholds, suppress noise, route to right team.

### Common alert types
- **High error rate** (5xx spike).
- **High latency** (p99 > SLO).
- **Service down** (health check fails).
- **Saturation** (disk full, queue backed up).
- **Anomaly** (unusual pattern, ML-based).
- **SLO burn** (budget consumed too fast).

### Routing
- **Severity**: P1 (page), P2 (page business hours), P3 (ticket).
- **Service**: route to owning team.
- **On-call rotation**: PagerDuty, OpsGenie.

### Runbooks
- Each alert links to a runbook.
- Runbook: what to check, how to mitigate, who to escalate.
- Reduces time to resolution.

### Anti-patterns
- Alerting on every metric (noise).
- Same alert going to multiple people.
- No documentation ("what does this mean?").
- Alerts that always fire (cry wolf).

### Key takeaway
Alert on **user-facing symptoms** (error rate, latency), make alerts **actionable**, route by
severity + team. Pair every alert with a runbook. Avoid alert fatigue — silence non-actionable
alerts.
