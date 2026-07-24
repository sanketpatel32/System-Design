# Error Budgets
> **Category:** Observability

---

### Overview
An **Error Budget** is the quantitative threshold of tolerable unreliability or downtime that a service can incur over a specific time window (e.g., 30 days or quarterly) before innovation/feature development is halted in favor of stability work. It bridges the natural friction between product development (moving fast) and Site Reliability Engineering (SRE) / operations (maintaining uptime).

### Mathematical Definition
The error budget is directly derived from the **Service Level Objective (SLO)**:

$$\text{Error Budget} = 100\% - \text{SLO}$$

For example, for a service with an uptime SLO of **99.9%** per month:
- **Allowed Downtime / Failure Budget:** $100\% - 99.9\% = 0.1\%$
- In a 30-day month ($43,200$ minutes): $\text{Allowed downtime} = 43,200 \times 0.001 = 43.2 \text{ minutes}$ (or $2,592$ allowed failed requests out of $2.592$ million total requests).

### Error Budget Management Lifecycle

```
+------------------+     SLO Breach Risk      +--------------------+
| Feature Releases | -----------------------> | Error Budget Burn  |
| & Experimentation|                          | Tracking (PromQL)  |
+------------------+                          +--------------------+
         ^                                              |
         |                                              v
+------------------+     Budget Exhausted     +--------------------+
| Resume Feature   | <----------------------- | Policy Enforcement |
| Deployments      |                          | (Freeze Releases)  |
+------------------+                          +--------------------+
```

### Burn Rate Alerting Strategies
Burn rate measures how fast a service consumes its error budget. A burn rate of 1 means the budget will be fully consumed exactly at the end of the SLO window.

| Burn Rate | Budget Consumed | Time to Exhaustion (30-day window) | Action Required |
|---|---|---|---|
| **1x** | 100% in 30 days | 30 days (720 hours) | Monitor; non-urgent |
| **2x** | 100% in 15 days | 15 days (360 hours) | Low-priority ticket |
| **14.4x** | 2% in 1 hour | 50 hours | PagerAlert to On-Call (Fast burn) |
| **60x** | 5% in 1 hour | 12 hours | Critical Page & Deployment Freeze |

### Error Budget Policy Matrix

| Remaining Budget | Release Status | Action / Governance |
|---|---|---|
| **> 50%** | Normal | Rapid feature releases, high experimentation allowed. |
| **10% - 50%** | Caution | Heightened canary monitoring, mandatory rollback plans. |
| **0% (Exhausted)**| Frozen | All feature deployments blocked; 100% engineering effort shifted to reliability, bug fixes, & tech debt. |

### Key takeaway
An **Error Budget** turns reliability from an abstract philosophical goal into a quantitative resource. It empowers engineering teams to take calculated risks when budget remains and enforces mandatory stability freezes when the budget is spent.
