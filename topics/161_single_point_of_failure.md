# Single Point of Failure

> **Category:** Reliability and Fault Tolerance

---

A Single Point of Failure (SPOF) is a **component in a system architecture whose individual failure causes the entire system to stop functioning**.

### SPOF Identification & Redundancy Transformation

```
Non-Redundant SPOF Architecture:
+--------+       +-------------------+ (SPOF!)       +--------------+
| Client | ----> | Primary Server    | ------------> | Single DB    |
+--------+       +-------------------+               +--------------+

High-Availability Redundant Architecture:
                                +-------------------+
                                | Load Balancer     |
                                +-------------------+
                                  /               \
            +--------------------+                 +--------------------+
            v                                      v
  +-------------------+                  +-------------------+
  | App Instance A    |                  | App Instance B    |
  +-------------------+                  +-------------------+
            \                                      /
             v                                    v
  +-----------------------------------------------------------------+
  | Primary Database with Multi-AZ Standby Sync Replication          |
  +-----------------------------------------------------------------+
```

### Common SPOF Targets & Mitigations

| System Layer | Potential SPOF Target | Redundancy Mitigation | Failover Mechanism |
| :--- | :--- | :--- | :--- |
| **DNS / Entry Point** | Single DNS Server IP | Anycast DNS across multi-providers | Automatic BGP route failover |
| **Load Balancing** | Single Nginx / HAProxy Node | Keepalived + Virtual IP (VIP) pair | VRRP Heartbeat takeover |
| **Application Layer** | Single Server Instance | Stateless Horizontal Scaling (Auto-Scaling) | Load balancer health checks |
| **Data Layer** | Single Database Instance | Multi-AZ Primary/Standby Replication | Automatic DNS/VIP failover (Patroni) |
| **Network Infrastructure**| Single Top-of-Rack Switch | Dual-homed network switches (LACP) | Hardware link aggregation |

### Engineering Audit Checklist

- **Identify Hidden Dependencies**: Shared single-node Redis caches, monolithic auth servers, or single cloud availability zones.
- **Failover Verification**: Test manual and automatic failover routinely (Chaos Engineering) to verify backup readiness.

### Key takeaway

Eliminate Single Points of Failure by **designing redundant components at every architecture layer**, combining stateless horizontal scaling with automated failover mechanisms.
