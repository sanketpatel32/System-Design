# Single Point of Failure

> **Category:** Reliability and Fault Tolerance

---

A Single Point of Failure (SPOF) is a **component, service, or physical dependency within a system architecture whose failure causes the entire system to stop functioning**. Eliminating SPOFs requires designing redundancy, automated failover, and fault domain isolation into every architectural tier.

### SPOF Identification & Elimination Architecture

Replacing single-point dependencies with redundant multi-AZ nodes, load balancers, and distributed data replication ensures high availability.

```
Vulnerable Single Point of Failure (SPOF) System Architecture:
+--------+       +-------------------+       +-----------------------+       +-------------------+
| Client | ----> | Single Load Balancer | -> | Single App Server Node| ----> | Single Primary DB |
+--------+       +-------------------+       +-----------------------+       +-------------------+
                  (SPOF #1: Crashes)         (SPOF #2: Memory OOM)           (SPOF #3: Disk Failure)
                  ==> ENTIRE SYSTEM UN-AVAILABLE!

High-Availability Redundant Architecture (Zero SPOF):
+--------+       +-------------------+       +-----------------------+       +-------------------+
| Client | ----> | DNS Anycast / BGP | ----> | Multi-AZ Load Balancer| ----> | Auto-Scaling App  |
+--------+       +-------------------+       +-----------------------+       | Server Cluster    |
                                                                             +-------------------+
                                                                                       |
                                                                             +-------------------+
                                                                             | Multi-AZ HA DB    |
                                                                             | (Primary + Replica|
                                                                             +-------------------+
```

### Common Architectural SPOFs & Mitigation Matrix

| Architectural Layer | Potential SPOF Hazard | Redundancy Mitigation Strategy | Automated Failover Mechanism |
| :--- | :--- | :--- | :--- |
| **DNS / Entry Route** | Single DNS Nameserver | Multi-Provider Anycast DNS | BGP Route Health Checking |
| **Ingress Load Balancing**| Single Load Balancer Instance | Active-Passive / Active-Active VRRP Pairs | Keepalived / Floating Virtual IP |
| **Application Layer** | Single Server Instance | Stateless Worker Pool across Availability Zones | Auto-Scaling Group (ASG) + Health Checks |
| **Database Layer** | Single Standalone RDBMS | Multi-AZ Primary + Synchronous Standby | Automated Failover (Orchestrator / Patroni) |
| **Physical Layer** | Single Power Supply / Top-of-Rack Switch| Dual Power Feeds, Multi-Region Deployment | Cloud Region Redundancy |

### Core Engineering Principles to Eliminate SPOFs

1. **Redundancy (N+1 and 2N)**: Ensure at least one redundant component (N+1) is online to assume traffic if an active node fails.
2. **Decoupled Architecture**: Use message queues to isolate producer services from consumer outages.
3. **Automated Health Checks & Self-Healing**: Continuous heartbeat probes detect failures and trigger automated DNS failover or container restarts without human intervention.

### Key Trade-offs & Production Realities

- ✅ **High Availability**: Eliminates unexpected system-wide outages caused by individual component crashes.
- ❌ **Cost Amplification**: Running redundant infrastructure increases operational spending (often 2x-3x).
- ❌ **Failover Complexity**: Automated failover mechanisms can themselves introduce bugs or split-brain scenarios if misconfigured.
### Multi-AZ Infrastructure Checklist for SPOF Elimination

- **Compute**: Minimum 2 EC2 instances or K8s pods deployed across 2+ Availability Zones (`us-east-1a`, `us-east-1b`).
- **Database**: Primary database in AZ-A with synchronous multi-AZ standby in AZ-B.
- **Load Balancer**: AWS Application Load Balancer (ALB) automatically provisioned across multiple AZ IP addresses.
- **Storage**: Use S3 (built-in multi-AZ durability) or EBS Multi-Attach volumes.

### Key takeaway

Eliminating Single Points of Failure requires **redundancy, multi-AZ isolation, and automated health-checked failover** at every layer of the system stack.
