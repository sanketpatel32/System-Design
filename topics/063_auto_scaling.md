# Auto Scaling

> **Category:** Scaling

---

**Auto Scaling** dynamically adjusts the number of active compute resources (virtual machines, containers, or pods) allocated to an application in response to real-time traffic fluctuations, resource utilization metrics, or scheduled events. This ensures high availability during peak traffic while minimizing resource costs during lulls.

### Architecture flow

```
  +--------------------+        +-------------------+        +--------------------+
  | Application Nodes  | -----> | Telemetry Metrics | -----> | Auto Scaling Engine|
  | (CPU, RAM, Req/s)  |        | (CloudWatch/Prom) |        | (KEDA / HPA / ASG) |
  +--------------------+        +-------------------+        +--------------------+
            ^                                                           |
            |                                                           | Evaluates Rules
            +------------------- Scaled Cluster ------------------------+
                             (Provision / Terminate)
```

### Scaling dimensions & strategies

Auto scaling operates horizontally (scaling out/in) or vertically (scaling up/down) based on specific policy drivers:

1. **Horizontal Pod/Instance Autoscaling (HPA/ASG)**: Adds or terminates instances based on target thresholds.
2. **Vertical Autoscaling (VPA)**: Adjusts CPU and memory resource allocations of existing instances.
3. **Reactive Scaling**: Triggers scaling actions when metrics cross defined thresholds (e.g., target CPU > 70% for 3 minutes).
4. **Predictive Scaling**: Uses historical traffic trends and machine learning models to pre-provision capacity before expected traffic spikes.
5. **Schedule-Based Scaling**: Pre-allocates resources according to known recurring events (e.g., Black Friday sales or daily business hours).

### Metrics & Scaling Trade-Off Matrix

| Scaling Metric | Metric Sensitivity | Best Used For | Drawbacks / Challenges |
| :--- | :--- | :--- | :--- |
| **CPU Utilization** | High | CPU-bound workloads (rendering, crypto) | Misleading for I/O-bound or blocking calls |
| **Memory Usage** | Slow / Sticky | Memory-intensive apps | Garbage collection spikes can cause thrashing |
| **Request Rate (RPS)** | Instant | Web servers, REST APIs | Spikes may trigger over-provisioning |
| **Queue Depth (SQS/Kafka)**| High | Asynchronous worker processing | Workers must drain backlog cleanly before scale-in |

### Implementation pitfalls & solutions

- **Thrashing (Flapping)**: Rapid, repeated scaling out and scaling in caused by abrupt metric fluctuations. *Solution*: Enforce cooldown periods (stabilization windows) before executing scale-in actions.
- **Warm-Up Latency**: Cold container startups can cause incoming requests to fail while waiting for new nodes to spin up. *Solution*: Maintain pre-warmed pools, warm start scripts, or aggressive readiness probes.
- **Database Connection Flooding**: Rapidly adding backend instances can overwhelm database connection limits. *Solution*: Implement connection pooling proxies (PgBouncer) and strict max connection caps.

### Key takeaway

Effective auto-scaling relies on choosing the right indicator metrics, enforcing cooldown stabilization windows to prevent thrashing, and keeping container warm-up times minimal to ensure elastic responsiveness under burst traffic.
