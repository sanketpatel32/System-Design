# Chaos Testing

> **Category:** Reliability and Fault Tolerance

---

Chaos testing (or Chaos Engineering) is the discipline of **intentionally injecting controlled failures into production or staging systems** to uncover hidden architectural weaknesses, verify fault tolerance mechanisms, and build confidence in a system's capability to withstand turbulent conditions.

### Chaos Engineering Pipeline Architecture

The chaos experiment framework formulates hypotheses, injects controlled failure events, and evaluates system steady-state metrics while maintaining automatic blast-radius abort triggers.

```
+----------------------------------------------------------------------------------------------------+
|                                      Chaos Experiment Engine                                       |
+----------------------------------------------------------------------------------------------------+
     |
     | 1. Formulate Hypothesis ("If Redis Cache dies, API latencies stay under 200ms via Fallback")
     | 2. Measure Steady State Metrics (P99 Latency = 45ms, Error Rate = 0.01%)
     v
+----------------------------------------------------------------------------------------------------+
| Fault Injection Phase                                                                               |
| - Kill 50% of Redis Pods                                                                          |
| - Inject 200ms Network Latency on DB Interface                                                     |
+----------------------------------------------------------------------------------------------------+
     |
     | 3. Continuously Monitor Blast Radius & Steady State Metrics
     v
+----------------------------------------------------------------------------------------------------+
| Evaluation & Abort Controller                                                                      |
| - Result A: System Gracefully Degrades (Passed!)                                                   |
| - Result B: Error Rate exceeds 5% -> AUTOMATIC ABORT ENGINES REVERT FAULTS!                        |
+----------------------------------------------------------------------------------------------------+
```

### Common Chaos Fault Injections Matrix

| Fault Type | Injection Mechanism | System Capability Tested | Target Vulnerability Uncovered |
| :--- | :--- | :--- | :--- |
| **Instance Failure** | Terminate random EC2/Kubernetes pods | Auto-Scaling & Load Balancer Health Checks | Hardcoded IP dependencies, slow boot times |
| **Network Latency** | Add 500ms packet delay via `tc` (traffic control)| Timeouts & Circuit Breakers | Cascading thread pool exhaustion |
| **Packet Loss** | Drop 20% of network traffic via iptables | Retry logic & Idempotency | Missing retries, unhandled socket exceptions |
| **Clock Drift** | Offset NTP system clock by +5 seconds | Distributed Locks & Token Expiration | Invalidated JWT tokens, LWW data corruption |
| **Disk Saturation** | Fill disk partition to 100% capacity | Log rotation & Disk Full Handling | Database crash loops due to unflushable WAL |

### Principles of Chaos Engineering

1. **Define Steady State**: Establish measurable metrics (e.g. successful orders per minute, P99 response latency).
2. **Formulate a Hypothesis**: Predict how the system will behave during a failure before running the test.
3. **Minimize Blast Radius**: Start experiments in staging or on a tiny fraction of production traffic (e.g. 1% of users).
4. **Automate Abort Triggers**: Automatically roll back fault injection if error rates exceed safety thresholds.

### Key Trade-offs & Organizational Requirements

- ✅ **Uncovers Hidden Production Bugs**: Exposes unhandled edge cases, bad timeouts, and missing fallback paths before real disasters occur.
- ❌ **Risk of Real Outages**: Improperly executed experiments can cause actual customer-facing outages.

### Key takeaway

Chaos testing proactively validates system resilience by **injecting controlled failures into systems while monitoring steady-state metrics and maintaining automatic safety abort triggers**.
