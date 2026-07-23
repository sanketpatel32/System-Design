# Estimate Number of Servers

> **Category:** Back-of-the-Envelope Estimation

---

Server count drives your cost, availability, and ops complexity. It's a derived number — start
from RPS.

### Formula
```
servers = ceil(peak_RPS / per_server_RPS) × redundancy_factor
```

### Per-server capacity (rules of thumb)
| Tier | Single instance |
|------|-----------------|
| Stateless API (CPU-bound) | ~5-10k RPS |
| Stateless API (I/O-bound, async) | ~10-50k RPS |
| DB (read replica) | ~5-10k QPS |
| Cache (Redis) | ~100k ops/sec |

### Worked example
- Peak RPS = 100k
- Each API server handles 5k RPS
- 100k / 5k = **20 servers**
- × 1.3 safety margin = 26
- Spread across 3 AZs → round up to **27 servers** (9 per AZ)

### Always provision for redundancy
- **N+1** within an AZ (one can fail).
- **Multi-AZ** (one AZ can fail).
- **Multi-region** for high availability (active-active or active-passive).

### Why over-provision
- Autoscaling lag (1-5 min).
- Garbage collection spikes.
- Noisy neighbors on shared cloud.
- Deployments need rolling capacity.

### Cost sanity check
- 27 c5.2xlarge ≈ 27 × $0.34/hr × 730 hr/month ≈ **$6,700/month**.
- Multiply across all tiers: API, worker, cache, DB, LB, NAT — total infra bill.

### Key takeaway
Server count = **peak RPS / per-server RPS × redundancy**. Always round up and spread across
AZs.
