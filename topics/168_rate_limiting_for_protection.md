# Rate Limiting for Protection

> **Category:** Reliability and Fault Tolerance

---

Rate limiting for protection is a defensive control mechanism deployed at API Gateways and ingress proxies to **control the rate of incoming traffic consumed by clients**. It shields backend services against noisy neighbors, volumetric DDoS attacks, resource starvation, and brute-force abuse.

### Rate Limiter Ingress Architecture

The rate limiter intercepts incoming HTTP requests, evaluating client quota keys against an in-memory counter store (e.g. Redis) before allowing traffic downstream.

```
+--------------+     1. HTTP POST /api/v1/resource     +--------------------+
| Client App   | -------------------------------------> | Ingress Gateway    |
+--------------+                                        | & Rate Limiter     |
                                                        +--------------------+
                                                           /                                                   2. Check Quota (Redis) /                \ 3. Quota Exceeded!
                                                           v                  v
                                                +------------------+  +----------------------+
                                                | Redis Counter    |  | HTTP 429 Too Many    |
                                                | Key: `user_101`  |  | Requests             |
                                                | Count: 101/100   |  | Retry-After: 30      |
                                                +------------------+  +----------------------+
                                                                                  |
                                                                       Returned to Client Immediately!
```

### Rate Limiting Algorithms Comparison Matrix

| Algorithm | Mechanism | Memory Footprint | Burst Handling | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Token Bucket** | Tokens refill at fixed rate; requests consume tokens | Low (2 variables) | Excellent (Allows controlled bursts) | General API rate limiting (AWS, Stripe) |
| **Leaky Bucket** | Requests enter queue; leak out at smooth constant rate | Queue Memory | Smooths Bursts (No burst traffic allowed) | E-commerce checkout queues |
| **Fixed Window** | Counts requests per fixed time window (e.g. 1 min) | Minimal | Bad (Allows 2x burst across window boundary) | Basic rate protection |
| **Sliding Window Log**| Logs exact request timestamps in sorted set | High memory | Perfect Precision | High-security financial APIs |
| **Sliding Window Counter**| Combines current and previous window counts weighted | Minimal | Smooth Approximation | Distributed Redis Rate Limiters |

### Standard Rate Limit HTTP Response Headers

When rate limiting a client, APIs return `429 Too Many Requests` alongside diagnostic headers:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1721837400
Retry-After: 60
```

### Key Trade-offs & Production Considerations

- ✅ **System Protection & SLA Enforcement**: Protects database and microservice infrastructure from traffic surges.
- ❌ **Centralized Redis Bottleneck**: Rate-limiting checks add a network hop to every incoming request. Use local in-memory token buckets with periodic Redis sync.
### Production Token Bucket Redis Lua Script

```lua
-- Redis Token Bucket Rate Limiter Lua Script
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current_time = tonumber(ARGV[2])
local clear_before = current_time - 60 -- 1 minute sliding window

redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)
local current_requests = redis.call('ZCARD', key)

if current_requests < limit then
    redis.call('ZADD', key, current_time, current_time)
    redis.call('EXPIRE', key, 60)
    return 1 -- Allowed
else
    return 0 -- Rate Limited!
end
```

### Key takeaway

Rate limiting protects backend systems from overload by **monitoring request counts per client key and dropping excess traffic with HTTP 429 responses**.
