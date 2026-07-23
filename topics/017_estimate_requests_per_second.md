# Estimate Requests Per Second

> **Category:** Back-of-the-Envelope Estimation

---

RPS (requests/sec) sizes your app tier, load balancers, and database load.

### Formula
```
RPS = DAU × requests_per_user_per_day / 86400
```

### Worked example — news feed
- DAU = 100M
- Each user opens app 5 times, each open makes 20 API calls
- = 100 calls/user/day
- 100M × 100 = 10B calls/day ÷ 86400 = **~116k RPS average**

### Peak multiplier
Traffic is never flat. Peak is typically **2x–10x** average depending on product:
| Product type | Peak/Avg ratio |
|--------------|----------------|
| B2B SaaS | ~2x (work hours) |
| Social network | ~3x (evening) |
| News site | ~5-10x (breaking news) |
| E-commerce sale | ~20-50x (flash sale) |

So 116k avg × 3x = **~350k peak RPS**.

### Read vs write split
- Read-heavy (feed): 95% reads, 5% writes.
- Write-heavy (messaging): closer to 50/50 or write-dominant.

This decides whether you need read replicas (cheap) or aggressive write scaling (sharding).

### Instance count
```
instances = ceil(peak_RPS / per_instance_RPS)
```
A tuned web instance handles ~5k RPS. So 350k peak → ~70 instances, plus N+1 redundancy.

### Key takeaway
Average RPS tells you cost; **peak RPS** tells you capacity. Always design for the peak.
