# Estimate Bandwidth Requirement

> **Category:** Back-of-the-Envelope Estimation

---

Bandwidth = **data transferred per second** between your service and clients. Sizes your NIC,
load balancer, CDN, and egress cost.

### Formula
```
Egress/sec = peak_RPS × avg_response_size
```

### Bytes per content type
| Response | Size |
|----------|------|
| API JSON | 1-10 KB |
| Webpage (HTML+CSS+JS) | 1-3 MB |
| Image | 200 KB |
| Video segment (HLS) | 1-5 MB |
| News feed payload | 50-200 KB |

### Worked example — Instagram feed
- DAU 500M, opens app 10x, fetches feed of 20 photos
- = 200 photo-fetches/user/day
- 500M × 200 × 200KB = 20 PB/day
- ÷ 86400 = 230 GB/s peak avg, × 3 peak = **~700 GB/s**

That's why **CDN is mandatory** for media — your datacenter could never egress that.

### Egress cost
AWS charges ~$0.09/GB egress. 700 GB/s would be $5.5M/day (!). The CDN cuts origin egress by
99%+.

### Compression wins
- gzip on JSON: 70% reduction.
- WebP vs JPEG: 30% smaller at same quality.
- HLS adaptive bitrate: serve 360p on slow connections.

### Key takeaway
For media-heavy products, **bandwidth cost dominates everything**. CDN + compression are not
optimizations, they're requirements.
