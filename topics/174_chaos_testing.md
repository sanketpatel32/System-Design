# Chaos Testing

> **Category:** Reliability and Fault Tolerance

---

Chaos Testing (or Chaos Engineering) is the discipline of **experimenting on a distributed system by intentionally injecting production failures** (server crashes, network latency, partition drops) to verify resilience hypothesis.

### Chaos Engineering Pipeline

```
+-----------------------------------------------------------------------------------+
|                          1. Define Steady-State Baseline                          |
|                          (e.g., Order Success Rate = 99.9%)                       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v 2. Formulate Hypothesis
+-----------------------------------------------------------------------------------+
|               "Hypothesis: Losing 1 Availability Zone won't drop QPS"             |
+-----------------------------------------------------------------------------------+
                                          |
                                          v 3. Inject Chaos Fault
+-----------------------------------------------------------------------------------+
|                  Chaos Agent Terminates 30% of App Pods (Chaos Mesh)              |
+-----------------------------------------------------------------------------------+
                                          |
                                          v 4. Observe Metrics & Verify Circuit Breakers
+-----------------------------------------------------------------------------------+
|             Success: Steady state maintained! System auto-healed in 3s            |
+-----------------------------------------------------------------------------------+
```

### Common Chaos Fault Injection Types

| Fault Type | Mechanism | Target Component | Verifies Architecture Layer |
| :--- | :--- | :--- | :--- |
| **Instance Termination** | Abruptly kills random VM/Pod | App Compute Instances | Kubernetes Auto-healing & Load Balancing |
| **Network Latency Injection**| Injects 500ms artificial delay | RPC Network Traffic | Timeouts & Circuit Breaker tripping |
| **Packet Loss / Blackhole**| Drops 100% of packets between AZs | Multi-AZ Network Links | Fallback Degraded Modes & Retries |
| **Clock Drift Injection**| Skews system clock by +/- 5 seconds | Distributed DB Nodes | Consensus & Timestamp Ordering |

### Key Rules of Engagement

- **Run in Staging First**: Validate failure injection logic in non-production environments before executing automated production experiments.
- **Emergency Stop Button**: Always maintain an automated rollback kill-switch to immediately abort chaos experiments if steady-state metrics breach safety thresholds.

### Key takeaway

Validate distributed resilience by **intentionally injecting real-world network and server failures**, ensuring systems auto-heal before production outages strike.
