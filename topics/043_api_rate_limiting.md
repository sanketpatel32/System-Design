# API Rate Limiting

> **Category:** API Design

---

Rate limiting caps how many requests a client can make in a time window. Protects the API
from abuse, runaway scripts, and noisy neighbors.

### Why rate limit
- **Protect the service** from overload / DDoS.
- **Fairness** between tenants.
- **Monetization** (free vs paid tiers).
- **Cost control** (expensive endpoints).

### Common algorithms
| Algorithm | How |
|-----------|-----|
| **Fixed window** | Count requests per fixed window (e.g. 100/min). Bursty at edges. |
| **Sliding window log** | Track each request timestamp. Precise but memory-heavy. |
| **Sliding window counter** | Hybrid: weighted average of current + previous window. |
| **Token bucket** | Bucket of N tokens, refills at R/sec. Allows bursts. |
| **Leaky bucket** | Queue processes at fixed rate. Smooths traffic. |

### Where to limit
- **Per IP** — basic abuse protection.
- **Per user / API key** — fair quota.
- **Per endpoint** — protect expensive operations.
- **Global** — backstop against the whole system.

### Distributed rate limiting
A single in-memory counter doesn't work across instances. Options:
- **Redis** counter with TTL.
- **Redis + Lua** for atomic check-and-increment.
- **Token bucket in Redis** (e.g. redis-cell).
- **Dedicated service** (e.g. Stripe's rate limits, Envoy, API Gateway).

### Response
- Return **429 Too Many Requests**.
- Include headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

### Key takeaway
Rate limit at the **API gateway** before requests hit your app. Use **token bucket** for most
cases (allows bursts). Return 429 with `Retry-After` so clients back off cleanly.
