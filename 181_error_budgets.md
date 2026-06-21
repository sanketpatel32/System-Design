# Error Budgets

> **Category:** Observability

---

An error budget = **the allowed amount of unreliability** based on your SLO. A core SRE
concept.

### The math
If your SLO is **99.9% availability** over 30 days:
- Total minutes: 30 × 1440 = 43,200
- Allowed downtime: 0.1% × 43,200 = **43 minutes**
- That's your **error budget** for the month.

### Why error budgets
- Quantify "how much breakage is acceptable."
- Balance **reliability** vs **velocity**.
- When budget exhausted → freeze changes, focus on stability.

### Policy
- **Budget healthy**: deploy freely, take risks.
- **Budget low**: slow down, more testing.
- **Budget exhausted**: change freeze, all hands on stability.

### Burn rate
- How fast are you consuming budget?
- Fast burn (used 10% in one day): page immediately.
- Slow burn (used 50% over a month): ticket for review.

### Multi-window alerts
- Page on: 2% budget burn in 1 hour AND 1 hour window.
- Long-window: confirm sustained (not a fluke).
- Avoids flapping alerts.

### Real-world
- **Google**: hard change freeze when budget exhausted.
- **Startups**: more lenient, but the framework still applies.

### SLOs vs SLAs
- **SLA** (contract): what you promise customers. Breaking = refunds.
- **SLO** (internal): what you aim for, stricter than SLA.
- **Error budget** = SLO - actual performance.

### Example
- SLA: 99.5% (22 min downtime / month allowed before refunds).
- SLO: 99.9% (43 min budget).
- Buffer: 99.9% gives margin above SLA's 99.5%.

### Key takeaway
Error budgets quantify acceptable breakage. Set SLOs stricter than SLAs. When budget is
healthy, deploy freely; when exhausted, freeze and stabilize. Alert on burn rate (fast vs
slow) to balance speed and reliability.
