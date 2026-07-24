# Dashboards

> **Category:** Observability

---

Dashboards provide **real-time visual aggregations of key metrics, charts, and system status indicators**, enabling operators to assess system health at a glance during normal operations and incidents.

### Operational Dashboard Layout Architecture

```
+-----------------------------------------------------------------------------------+
|                        TOP PANEL: Executive High-Level Health                     |
|  [ Overall System Status: HEALTHY ]   [ Global QPS: 42,100 ]   [ Error Rate: 0.01% ]  |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
+------------------------------------+                    +------------------------------------+
| PANEL 2: Four Golden Signals       |                    | PANEL 3: Infrastructure Saturation |
| - P99 Latency Waterfall Chart      |                    | - CPU % Across Kubernetes Nodes   |
| - 5xx Error Rate by Service        |                    | - Memory RAM Usage & Disk I/O      |
+------------------------------------+                    +------------------------------------+
```

### Dashboard Design Guidelines Matrix

| Dashboard Type | Target Audience | Primary Focus | Key Metrics |
| :--- | :--- | :--- | :--- |
| **Executive / High-Level**| Engineering Directors | System SLA/SLO compliance | Availability nines, overall QPS, total revenue |
| **System / Service Level**| On-call SREs & Engineers | Operational health & debugging | Golden Signals (Latency, Traffic, Errors, Saturation)|
| **Infrastructure Level** | DevOps / Platform Engineers| Capacity planning & limits | Node CPU, Memory RAM, Disk IOPS, Network Egress |

### Best Practices for Dashboard UX

- **P99 vs Average Latency**: Always visualize 90th, 95th, and 99th latency percentiles; averages hide severe tail-latency spikes experienced by users.
- **Consistent Time Ranges & Color Coding**: Standardize colors (Green = Normal, Yellow = Warning, Red = Critical) and align time axes across panels for easy cross-metric correlation.

### Key takeaway

Build dashboards around **the Four Golden Signals using high-percentile metrics (P99)**, structuring views hierarchically to accelerate incident triage.
