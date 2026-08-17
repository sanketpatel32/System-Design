# API Rate Limiting

> **Category:** API Design

---

**API Rate Limiting** caps the number of requests a client can transmit to an API within a specified time window. Rate limiting protects backend services from DDoS attacks, runaway web crawlers, noisy neighbors, and resource starvation.

### Distributed Rate Limiter Topology

```
+-------------------------------------------------------------------------+
|                  DISTRIBUTED RATE LIMITER ARCHITECTURE                  |
+-------------------------------------------------------------------------+

  [ Ingress Request ] (Header: Authorization / IP / API-Key)
          |
          v
  +-----------------------------------------------------------------------+
  | API GATEWAY RATE LIMITING MIDDLEWARE                                  |
  +-----------------------------------------------------------------------+
          |
          v (Atomic Lua Script Check)
  [ Redis Cluster: Key = "ratelimit:user_42" TTL = 60s ]
          |
          +-----------------------+-----------------------+
          | (Counter <= Limit)    | (Counter > Limit)     |
          v                       v                       v
  [ Forward to Backend Svc ]      [ Return HTTP 429 Too Many Requests ]
  X-RateLimit-Remaining: 49       Retry-After: 30
```

### Rate Limiting Algorithms Comparison

| Algorithm | Mechanism | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Token Bucket** | Tokens refill at rate R/sec into bucket of capacity N. Request consumes 1 token. | Allows short bursts; memory efficient. | Token refill math tuning required. |
| **Leaky Bucket** | Requests queue in bucket and leak out at fixed smooth rate. | Smooths bursty traffic into steady output rate. | Bursts are delayed; queue overflow drops requests. |
| **Fixed Window Counter** | Counts requests in fixed time windows (e.g., 100 req/min). | Extremely memory simple. | Edge traffic burst: 2× quota at window boundaries. |
| **Sliding Window Log** | Stores timestamp of every request in sorted set (Redis ZSET). | 100% accurate sliding window protection. | High memory footprint (O(N) stored timestamps). |
| **Sliding Window Counter**| Hybrid: weighted sum of current window count + previous window count. | Smooth traffic protection; minimal memory. | Approximates edge window counts (99%+ accuracy). |

### HTTP Standard Rate Limit Headers

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1672531200
Retry-After: 60
```

### Key takeaway

Enforce rate limiting at the **API Gateway tier** using **Token Bucket** or **Sliding Window Counter** algorithms backed by Redis Lua scripts. Return **HTTP 429 Too Many Requests** with `Retry-After` headers.
