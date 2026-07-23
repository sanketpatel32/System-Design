# Dashboards

> **Category:** Observability

---

Dashboards = **visual representations of metrics**, designed to make system health
glanceable.

### Why
- Quick assessment of system health.
- Spot trends and anomalies.
- Debug during incidents.
- Communicate with stakeholders.

### Dashboard types

#### 1. Service overview
- One per service.
- RED metrics: Rate, Errors, Duration.
- Dependency status.

#### 2. SLO / SLI dashboard
- Error budget burn-down.
- Availability over time.

#### 3. Infrastructure
- CPU, memory, disk, network per host.
- Saturation indicators.

#### 4. Business KPIs
- Signups, revenue, active users.
- For stakeholders.

#### 5. Incident dashboard
- Pre-built views for common incidents.
- "When X is broken, look here."

### Design principles
- **Glanceable**: key info in 5 seconds.
- **Drill-down**: click for details.
- **Consistent layout**: same place for same metric.
- **Time range**: configurable (last hour, day, week).
- **Annotations**: mark deploys, incidents.

### Common metrics
- Request rate (per second).
- Error rate (%).
- Latency percentiles (p50, p95, p99).
- CPU / memory utilization.
- Queue depth.
- Cache hit rate.
- DB connections.

### Tools
- **Grafana** (open source, popular).
- **Datadog, New Relic** (commercial).
- **Kibana** (for logs).
- **Tableau, Looker** (business analytics).

### Anti-patterns
- Too many panels (information overload).
- Pretty but useless (no actionable info).
- Stale (no one updates).
- Per-metric instead of per-goal.

### Key takeaway
Dashboards make system health glanceable. One overview per service (RED), SLO dashboards for
budgets, business KPIs for stakeholders. Keep them focused and actionable. Grafana + Prometheus
is the open source standard.
