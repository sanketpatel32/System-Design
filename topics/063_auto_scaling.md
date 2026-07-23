# Auto Scaling

> **Category:** Scaling

---

Autoscaling = **automatically add or remove instances** based on load. Matches capacity to
demand in real time.

### Why
- **Cost**: don't pay for idle capacity off-peak.
- **Availability**: absorb traffic spikes.
- **Operational**: no manual 3am paging to add servers.

### Scaling dimensions
- **Horizontal**: change instance count (most common).
- **Vertical**: change instance size (rare, requires reboot).

### Triggers
| Metric | Use case |
|--------|----------|
| CPU utilization | CPU-bound web/app |
| Memory | In-memory caches |
| Request count per target | QPS-driven |
| Queue length | Worker pools |
| Custom metric (CloudWatch) | Business KPIs |

### Patterns
- **Target tracking**: "keep CPU at 60%". Simple, robust.
- **Step scaling**: bigger steps at bigger thresholds.
- **Predictive**: scale before expected spikes (ML on history).

### Cooldowns & stabilization
- **Cooldown**: 60-300s between scaling actions (avoid thrash).
- **Warm-up**: new instances need time before they take traffic.

### Common pitfalls
- **Cold starts** — new instances take 1-5 min to boot, app, warm cache.
- **Scale-in churn** — terminating instances drops in-flight requests (use draining).
- **Wrong metric** — scaling on CPU when bottleneck is DB.
- **Cascading failure** — autoscaling can't keep up with a self-amplifying problem.

### Managed options
- **AWS Auto Scaling** (EC2, ECS, EKS).
- **Kubernetes HPA / VPA / Cluster Autoscaler / Karpenter**.
- **Cloud Run / Lambda** — request-level autoscaling (0 to N).

### Key takeaway
Autoscale on the **right metric** (usually queue depth for workers, CPU for CPU-bound), with
cooldowns to prevent thrash. Always combine with **graceful shutdown / draining** so scale-in
doesn't drop requests. Beware cold-start latency during spikes.
