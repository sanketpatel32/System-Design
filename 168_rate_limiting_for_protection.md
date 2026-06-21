# Rate Limiting for Protection

> **Category:** Reliability and Fault Tolerance

---

Rate limiting for protection = **using rate limits to defend your service** against
overload, abuse, and DDoS.

### Why
- A single client hammering your API can take it down.
- Bugs (infinite retry loops) cause runaway load.
- Malicious attacks (DDoS, scraping).
- Noisy neighbors (one tenant exhausting resources).

### Layers of rate limiting
| Layer | Limit |
|-------|-------|
| Edge / CDN | Per-IP, per-region (Cloudflare) |
| WAF | Block malicious patterns |
| API Gateway | Per-user, per-API-key |
| Service | Per-tenant, per-endpoint |
| DB | Connection limits, statement_timeout |

### Limit dimensions
- **Per IP** — basic abuse protection.
- **Per user / API key** — fair quotas.
- **Per endpoint** — protect expensive operations.
- **Global** — backstop.
- **Concurrent** — limit parallel requests, not just rate.

### Algorithms
- **Token bucket**: bursty but bounded.
- **Leaky bucket**: smooth.
- **Sliding window**: precise.
- **Fixed window**: simple.

### Response on limit exceeded
- **429 Too Many Requests**.
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.
- Optional: queue for later processing instead of rejecting.

### Distributed rate limiting
- Single in-memory counter doesn't work across instances.
- **Redis counter with TTL** (atomic via Lua).
- **Token bucket in Redis** (redis-cell).
- **Sliding window with sorted sets**.

### Adaptive rate limiting
- Adjust limits based on system load.
- When CPU high → tighten limits.
- When healthy → relax.
- Used by Netflix, Twitter.

### Key takeaway
Rate limit at every layer (CDN → WAF → gateway → service). Use **token bucket** for most cases.
Return 429 with `Retry-After`. For distributed systems, use Redis with atomic Lua scripts.
Adaptive limits respond to load.
