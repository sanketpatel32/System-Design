# Estimate Peak QPS

> **Category:** Back-of-the-Envelope Estimation

---

Peak QPS = **the maximum queries-per-second** you must serve. It sizes your autoscaling,
provisioning, and database headroom.

### How to compute
1. Compute **average QPS** from DAU.
2. Apply a **peak multiplier** (typically 2x–10x).
3. Add a **safety margin** (~30%) for unexpected spikes.

### Example — URL shortener
- 100M new URLs/day, 10x redirects → 1B reads/day
- Avg read QPS = 1B / 86400 ≈ 11.6k
- Peak multiplier 3x → 35k QPS
- +30% safety → **~45k peak QPS**

### Why peak matters
- DB connections, memory, CPU all sized to peak, not average.
- Cloud autoscaling takes 1-5 minutes to spin up; if you provision to average, you'll 500 during
  the spike.
- **Connection pools** are sized to peak concurrency, which equals peak RPS × per-request latency
  (Little's Law).

### Spiky vs steady
- **Steady** (background jobs, batch) → size to average.
- **Spiky** (web traffic, notifications) → size to peak × 1.3.

### Mitigation strategies
- **Queue + workers** to flatten spikes (absorb in Kafka, process at steady rate).
- **CDN + cache** to cut origin peak.
- **Pre-warmed autoscaling** for known events (Black Friday, Super Bowl).

### Key takeaway
Average QPS is for cost; peak QPS is for capacity. Always provision for **peak × safety margin**,
and use async/queue patterns to flatten what you can.
