# Monitoring

> **Category:** Observability

---

Monitoring = **continuously watching your system's behavior** to detect issues before users
notice.

### Why
- Catch problems before users do.
- Debug incidents.
- Track SLOs.
- Plan capacity.

### What to monitor
- **Infrastructure**: CPU, memory, disk, network.
- **Application**: request rate, latency, error rate.
- **Dependencies**: DB, cache, queue health.
- **Business**: signups, revenue, active users.

### Layers
1. **Black-box**: external probe (is the homepage up?).
2. **White-box**: internal metrics (request rate, latency).
3. **Logs**: detailed events.
4. **Traces**: per-request flow.

### Approaches
| Method | What |
|--------|------|
| **USE** | Utilization, Saturation, Errors (resources) |
| **RED** | Rate, Errors, Duration (services) |
| **Four Golden Signals** | Latency, Traffic, Errors, Saturation |

### Dashboards
- **Service overview**: RED metrics per service.
- **SLO dashboard**: error budget burn-down.
- **Dependency health**: DB, cache, queue.
- **Business KPIs**: signup rate, revenue.

### Tools
- **Prometheus + Grafana** (open source, popular).
- **Datadog, New Relic** (commercial).
- **CloudWatch, Stackdriver** (cloud-native).

### Alerting
- Alert on **user-facing symptoms** (high error rate, latency).
- Don't alert on causes (CPU > 80% — might be fine).
- Page on SLO burn-rate; warn on trends.

### Synthetic monitoring
- Probes that simulate user behavior ("open app, add to cart, checkout").
- Detect issues before real users hit them.
- Run from multiple geo locations.

### Real user monitoring (RUM)
- Track actual user experiences (page load time, errors).
- Capture in browser / app.

### Key takeaway
Monitor at every layer: infrastructure, app, dependencies, business. Use **RED/USE/Golden
Signals** as frameworks. Alert on symptoms (error rate, latency), not causes. Combine black-box
(synthetic) and white-box (internal metrics) views.
