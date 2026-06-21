# Failover

> **Category:** Load Balancing

---

Failover = **automatically switch traffic to a redundant component** when the primary fails.
Critical for meeting availability SLOs.

### Levels of failover
| Level | What fails | Recovery |
|-------|-----------|----------|
| Process | App crash | Restart (systemd, k8s) |
| Instance | VM dies | Replace (autoscaling) |
| AZ | Data center outage | Reroute to other AZs |
| Region | Region outage | DNS failover to other region |

### How it triggers
- **Health check fails** → LB pulls instance out.
- **Heartbeats stop** → primary marked dead.
- **Quorum lost** → cluster elects new leader (Raft, Paxos).

### Failover patterns
- **Active-passive**: primary serves, standby waits. On failure, standby promotes. Simple but
  wastes capacity.
- **Active-active**: all instances serve. On failure, others absorb load. Efficient but needs
  conflict resolution.

### Database failover
- **Promote a read replica** (RDS, Aurora): 30s-2min.
- **Consensus cluster** (etcd, CockroachDB): leader election, seconds.
- **Multi-master**: any node accepts writes; resolve conflicts.

### DNS failover (region-level)
- Route 53 health-checks an endpoint in each region.
- On failure, changes DNS to point to the other region.
- Limited by **TTL** — clients cache old answer for up to TTL seconds.

### Gotchas
- **Split-brain** — both halves think they're primary. Solve with quorum / fencing / STONITH.
- **Cascading failures** — failover traffic overwhelms standby. Capacity plan!
- **Stale DNS** — clients keep hitting the dead IP until TTL expires.
- **Data loss** with async replication (RPO > 0).

### Key takeaway
Design every tier for failover: redundant instances across AZs, automated health checks, leader
election for stateful services, and DNS-level failover between regions. Practice failover in
chaos tests — untested failovers fail in production.
