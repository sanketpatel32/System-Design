# Design Rate Limiter

> **Category:** Beginner System Design Problems

---

Design a rate limiting service that throttles requests per client.

### Requirements
- **Functional**: limit per second / minute / hour; per API key / IP / user.
- **Non-functional**: low-latency check (<1ms); accurate; distributed.

### Algorithms
- **Token bucket**: bucket refills at R tokens/sec; bursty OK.
- **Leaky bucket**: smooth output rate.
- **Fixed window**: count per time bucket.
- **Sliding window**: more precise, rolling window.

### Architecture (distributed)
```
[Client] -> [API Gateway] -> [Rate Limiter middleware]
                                |
                                v
                             [Redis] (atomic INCR + Lua)
                                |
                                v
                            allow/deny -> [App]
```

### Redis Lua for atomicity
```lua
-- token bucket
local key = KEYS[1]
local tokens = redis.call('get', key) or capacity
tokens = math.min(capacity, tokens + (now - last) * rate)
if tokens >= 1 then
    redis.call('set', key, tokens - 1)
    return 1  -- allow
else
    return 0  -- deny
end
```

### Headers
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

### Response on limit
- **429 Too Many Requests** + `Retry-After: 30`.

### Where to limit
- **API Gateway** (best — before app sees request).
- **Service middleware** (per-service limits).
- **DB layer** (connection limits).

### Variants
- **Per-user**: fair quotas.
- **Per-IP**: basic abuse protection.
- **Global**: backstop.
- **Per-endpoint**: protect expensive ops.

### Key takeaway
Rate limiter = **Redis + Lua script** for atomic token bucket. Limit at the gateway before
hitting app servers. Return 429 with `Retry-After`. Per-user for fair quotas, per-IP for abuse.
