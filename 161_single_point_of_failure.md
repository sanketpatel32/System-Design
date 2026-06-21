# Single Point of Failure

> **Category:** Reliability and Fault Tolerance

---

A Single Point of Failure (SPOF) = **a component whose failure brings down the whole system.**
The #1 enemy of availability.

### Common SPOFs
- **Single app instance**: dies → service down.
- **Single database (no replica)**: dies → data + service down.
- **Single load balancer**: dies → all traffic blocked.
- **Single DNS server**: dies → can't resolve your domain.
- **Single region**: region outage → service down globally.
- **Single network path**: NIC failure → no traffic.
- **Single power source**: power loss → everything dead.

### How to eliminate
| Layer | Redundancy |
|-------|------------|
| App | N+1 instances per AZ, multi-AZ |
| DB | Read replica (failover target), multi-AZ |
| LB | Active-passive pair (VRRP), managed cloud LB |
| DNS | Multiple authoritative servers, multiple resolvers |
| Region | Multi-region active-active or active-passive |
| Network | Redundant NICs, multi-path routing |
| Power | Dual feeds, generators, UPS |

### Identify SPOFs
Walk the architecture diagram, ask: "if this dies, does the system survive?"
- Mark each box with **failure impact**.
- Any box that takes everything down → SPOF.

### The chain
Reliability compounds: a system is only as available as its weakest SPOF.
```
99.9% app × 99.9% DB × 99.9% cache = 99.7% end-to-end
```
Each tier must exceed the target.

### Cost
Redundancy costs money. Not everything needs 5 nines:
- **Blog**: tolerate some downtime, single instance OK.
- **Payments**: must be highly available, full redundancy.

### Key takeaway
Walk your architecture and identify every SPOF. Add redundancy at each: N+1 instances across
multi-AZ, read replica for DB failover, redundant LB. Don't accept a SPOF on the critical path.
