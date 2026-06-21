# Estimate Cost at a High Level

> **Category:** Back-of-the-Envelope Estimation

---

Cost estimates separate "we can afford this" from "this is a vanity architecture." Every
design decision has a monthly bill.

### Cost components
| Component | Cloud cost (rough) |
|------------|---------------------|
| Compute (c5.2xlarge) | $0.34/hr ≈ $250/mo |
| Storage SSD (gp3) | $0.08/GB/mo |
| Storage S3 | $0.023/GB/mo |
| Egress (out to internet) | $0.09/GB |
| Load balancer + LCUs | ~$200-2000/mo |
| Redis cache | $0.50/GB/mo |
| RDS Postgres (large) | $500-2000/mo |
| Kafka (MSK) | $500-3000/mo |
| CDN | $0.01-0.10/GB delivered |

### Worked example — photo sharing
- 1B photo views/day, 200KB each = 200 TB/day egress
- Without CDN: 200TB × $0.09 = **$18,000/day** egress alone.
- With CDN: ~95% cache hit → origin egress 10TB/day = $900/day. **20x savings**.

### Compute cost
- Peak RPS 100k, 5k/server → 20 servers + redundancy = 27
- × $250/mo = ~$7k/mo API tier

### Storage cost
- 100TB on S3 = $2.3k/mo
- 10TB on SSD for hot DB = $800/mo

### The 80/20 of cloud bills
1. **Egress** — minimize via CDN, compression.
2. **Compute** — autoscale, right-size, use spot.
3. **Storage** — tier to cold, lifecycle policies.
4. **Data transfer between regions** — often overlooked, very expensive.

### Key takeaway
Always multiply **rate × time** for cost. A $0.09/GB egress on a hot product is a budget-ending
number. CDN and compression are not optimizations — they're financial necessities.
