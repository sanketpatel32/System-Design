# Availability

> **Category:** System Design Basics

---

Availability = **the fraction of time a system is operational and serving requests.** Usually
quoted in "nines".

### The nines table
| Availability | Downtime / year | Downtime / week |
|--------------|-----------------|-----------------|
| 99%          | 3.65 days       | 1.7 hours       |
| 99.9%        | 8.76 hours      | 10 min          |
| 99.99%       | 52.6 min        | 1 min           |
| 99.999%      | 5.26 min        | 6 s             |

### How to improve availability
1. **Eliminate SPOFs** — every tier needs redundancy.
2. **Multiple AZs** — survive a data-center outage.
3. **Multiple regions** — survive a region outage (active-active or active-passive).
4. **Graceful degradation** — return partial results instead of failing.
5. **Health checks + failover** — detect and reroute quickly.
6. **Backpressure + retries with backoff** — don't cascade failures.

### Measured how?
```
Availability = Uptime / (Uptime + Downtime)
            = 1 - (failed_requests / total_requests)
```

### The cost of nines
Each additional nine roughly **doubles** cost and engineering effort. Going from 99.9% to 99.99%
requires multi-AZ; 99.999% requires multi-region with automated failover.

### Key takeaway
Pick the availability target based on **business impact**. Don't build 5-nines for a blog; do for
payments.
