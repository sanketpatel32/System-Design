# Monitoring

> **Category:** Observability

---

Monitoring is the continuous process of **collecting, aggregating, and analyzing system metrics, logs, and traces** to assess operational health and detect anomalies proactively.

### Integrated Observability Triad

```
                                  +-------------------+
                                  | Observability     |
                                  +-------------------+
                                            |
        +-----------------------------------+-----------------------------------+
        |                                   |                                   |
        v                                   v                                   v
+---------------+                   +---------------+                   +---------------+
| Metrics       |                   | Logs          |                   | Traces        |
| (Numerical    |                   | (Text Event   |                   | (Request Path |
| Time-Series)  |                   | Records)      |                   | Waterfalls)   |
+---------------+                   +---------------+                   +---------------+
```

### Black-Box vs White-Box Monitoring

| Type | Perspective | Data Source | Detects | Example Tools |
| :--- | :--- | :--- | :--- | :--- |
| **Black-Box Monitoring** | External user perspective | Synthetic HTTP Pings from outside network | Outages, DNS drops, TLS expiry | Pingdom, Datadog Synthetics |
| **White-Box Monitoring** | Internal system perspective| Internal JMX / Prometheus `/metrics` | CPU spikes, DB pool limits, GC pauses | Prometheus, Grafana |

### Observability Best Practices

- **Correlate the Triad**: Link logs, metrics, and traces using a shared `trace_id` so engineers can click from a Grafana metric latency spike straight to corresponding microservice error logs.

### Key takeaway

Combine **white-box and black-box monitoring across metrics, logs, and traces** to gain complete internal and external visibility into system health.
