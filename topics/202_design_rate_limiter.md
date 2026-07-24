# Design Rate Limiter
> **Category:** Beginner System Design Problems

---

### Overview
A **Rate Limiter** controls the rate of traffic sent by a client or service, throttling requests that exceed defined quota thresholds to protect backends from DDoS attacks, API abuse, and resource starvation.

### Architecture & Placement

```
+--------+       1. Request        +-------------------+       2. Atomic Check       +-------------------+
| Client | ----------------------> | API Gateway /     | --------------------------> | Redis Cluster     |
+--------+                         | Rate Limiter Mod  |                             | (Lua Scripting)   |
    ^                              +-------------------+ <-------------------------- +-------------------+
    |                                        |                 Allowed / Denied
    | 429 Too Many Requests (Rate Exceeded) | (If Allowed)
    +----------------------------------------+
                                             v 3. Forward Request
                                   +-------------------+
                                   | Backend Services  |
                                   +-------------------+
```

### Rate Limiting Algorithms Comparison

| Algorithm | Mechanism | Pros | Cons |
|---|---|---|---|
| **Token Bucket** | Bucket fills with tokens at rate $R$; request takes 1 token | Allows bursty traffic; memory efficient | Parameter tuning ($R$ and capacity $B$) |
| **Leaky Bucket** | Requests enter queue; processed at constant rate | Smooths output traffic rate | Bursts delay requests in queue |
| **Fixed Window** | Counts requests in fixed time window (e.g., 100/min) | Simple implementation | Boundary burst traffic ($2\times$ quota at edge) |
| **Sliding Window Counter** | Weighted average of current & previous window counts | Memory efficient; smooths edge bursts | Approx memory calculation (~99% accurate) |

### Distributed Rate Limiting via Redis Lua Script
```lua
-- KEYS[1]: rate limit key (e.g., rate:usr_123)
-- ARGV[1]: max_capacity, ARGV[2]: refill_rate, ARGV[3]: now_timestamp, ARGV[4]: requested_tokens
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local info = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(info[1]) or capacity
local last_updated = tonumber(info[2]) or now

-- Refill tokens based on elapsed time
local elapsed = math.max(0, now - last_updated)
tokens = math.min(capacity, tokens + elapsed * refill_rate)

if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
    return 1 -- Allowed
else
    return 0 -- Denied (Rate Limited)
end
```

### Response Headers
When rate-limited, return HTTP status `429 Too Many Requests` with standard HTTP headers:
- `X-RateLimit-Limit`: Maximum requests per window.
- `X-RateLimit-Remaining`: Remaining tokens in current window.
- `X-RateLimit-Reset`: Unix timestamp until bucket refills.
- `Retry-After`: Seconds client must wait before retrying.

### Key takeaway
Deploy rate limiters at the **API Gateway layer**. Execute atomic **Token Bucket** or **Sliding Window Counter** logic in **Redis using Lua scripts** to eliminate race conditions in multi-threaded environments.
