# Availability

> **Category:** System Design Basics

---

Availability is the **percentage of time a system remains operational and accessible** to process user requests successfully over a specified time period. It is commonly measured in "nines" (e.g., 99.9% vs. 99.999%).

### High Availability Architecture Topology

```
                  +-----------------------+
                  |  Global DNS / Anycast |
                  +-----------------------+
                              |
                +-------------+-------------+
                |                           |
                v                           v
     +--------------------+       +--------------------+
     | Primary DC / AZ    |       | Secondary DC / AZ  |
     | Active Load Balancer|      | Active Load Balancer|
     +--------------------+       +--------------------+
                |                           |
        +-------+-------+           +-------+-------+
        v               v           v               v
    +-------+       +-------+   +-------+       +-------+
    | App 1 |       | App 2 |   | App 3 |       | App 4 |
    +-------+       +-------+   +-------+       +-------+
        \               /           \               /
         v             v             v             v
      +-------------------+       +-------------------+
      | Master DB (Write) |======>| Read Replica (Sync)|
      +-------------------+ Replication +-------------+
```

### The "Nines" of Availability

| Availability Level | Downtime per Year | Downtime per Month | Downtime per Day | Typical Systems |
| :--- | :--- | :--- | :--- | :--- |
| **99% ("Two Nines")** | 3.65 days | 7.31 hours | 14.4 minutes | Internal batch tools, non-critical dashboards |
| **99.9% ("Three Nines")** | 8.76 hours | 43.8 minutes | 1.44 minutes | Standard SaaS applications |
| **99.99% ("Four Nines")** | 52.6 minutes | 4.38 minutes | 8.64 seconds | E-commerce core, payment gateways, APIs |
| **99.999% ("Five Nines")** | 5.26 minutes | 25.9 seconds | 0.86 seconds | Telecommunication core, financial settlements |
| **99.9999% ("Six Nines")** | 31.5 seconds | 2.59 seconds | 0.086 seconds | Mission-critical avionics, healthcare equipment |

### Mathematical Definition of Availability

Availability is calculated using **Mean Time Between Failures (MTBF)** and **Mean Time To Repair (MTTR)**:

$$\text{Availability} = \frac{\text{MTBF}}{\text{MTBF} + \text{MTTR}}$$

To maximize availability:
1. Increase **MTBF**: Build fault-tolerant components, perform rigorous code reviews, and conduct automated testing.
2. Decrease **MTTR**: Implement automated health checks, self-healing infrastructure, instant failover mechanisms, and automated blue/green deployments.

### Availability Architectures

- **Active-Passive (Failover)**: A primary node handles all traffic while a standby node receives updates. If the primary fails, the heart-beat monitor routes traffic to the secondary.
- **Active-Active (Multi-Primary)**: Multiple nodes serve traffic concurrently. If one node fails, remaining nodes absorb the load. Requires careful handling of state sync and split-brain resolution.

### Key takeaway

High availability requires eliminating **Single Points of Failure (SPOFs)** through redundancy, automated failover, and proactive health monitoring. Minimizing **Mean Time To Repair (MTTR)** via automation is key to achieving "four nines" (99.99%) or higher uptime.
