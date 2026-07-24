# Fault Tolerance

> **Category:** System Design Basics

---

Fault Tolerance is the property that enables a system to **continue operating properly in the event of hardware, software, or network failures** in one or more of its components. A fault-tolerant design prevents isolated failures (faults) from escalating into complete system outages.

### Fault Tolerance Architecture & Isolation Boundaries

```
+-------------------------------------------------------------------------+
|                  BULKHEAD & FAULT ISOLATION ARCHITECTURE                |
+-------------------------------------------------------------------------+

  [ Ingress Traffic ]
           |
     +-----+-----+
     |           |
     v           v
  +-----+     +-----+
  |PoolA|     |PoolB|  (Isolated Bulkheads - Pool A failure doesn't touch B)
  +-----+     +-----+
     |           |
     v           v
  +-----+     +-----+
  |Svc A|     |Svc B|
  +-----+     +-----+
     |           |  (Degraded Fallback response on Svc B fault)
     v           v
  [DB Prim]   [DB Repl]
```

### Key Fault Tolerance Mechanisms

| Pattern | Mechanism | Example Real-World Implementation |
| :--- | :--- | :--- |
| **Redundancy** | Deploying duplicate nodes ($N+1$ or $2N$ redundancy) to take over instantly upon failure. | Multi-AZ deployment of web application servers behind an ELB. |
| **Consensus Protocols** | Coordinating agreement across distributed nodes to handle leader failure. | Raft consensus algorithm in etcd, Consul, or ZooKeeper. |
| **Bulkheading** | Isolating resource pools (threads, memory, pools) so failure in one domain doesn't cascade. | Microservice thread pool isolation (Netflix Hystrix). |
| **Graceful Degradation**| Falling back to reduced service quality when non-critical components fail. | Disabling personalized recommendation carousel when ML cluster fails. |
| **Retry with Backoff & Jitter**| Automatically retrying failed network requests with exponential delay and randomized jitter. | AWS SDK request retries to prevent thundering herd problem. |

### Types of System Faults

1. **Transient Faults**: Brief network glitches or temporary service bursts. Managed via automatic retries with exponential backoff and jitter.
2. **Permanent Hardware Faults**: Total failure of a physical server, NIC, or NVMe drive. Managed via automated failover to standby nodes.
3. **Byzantine Faults**: Malicious or arbitrary software bugs where nodes send conflicting signals. Managed via Byzantine Fault Tolerant (BFT) consensus algorithms.

### Self-Healing Systems

High fault tolerance incorporates automated self-healing mechanisms:
- **Heartbeat & Health Checks**: Control planes monitor node health every few seconds.
- **Automated Node Replacement**: Container orchestrators (Kubernetes) automatically kill unhealthy pods and spin up replacements.

### Key takeaway

Fault tolerance ensures systems survive component failures without user-facing outages. Design for failure by establishing **fault isolation boundaries (bulkheads)**, implementing **automated failover and health checks**, and utilizing **exponential backoff with jitter** for network retries.
