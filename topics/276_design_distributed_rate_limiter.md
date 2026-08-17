# Design Distributed Rate Limiter

> **Category:** Advanced System Design Problems

---

A Distributed Rate Limiter throttles client API request volumes across multiple application servers, protecting microservices from DDoS attacks, resource exhaustion, and noisy-neighbor overload.

### System Requirements
- **Functional Requirements**:
  - Enforce request quotas per User ID, API Key, or IP Address across distributed server nodes.
  - Return standard HTTP `429 Too Many Requests` responses with `Retry-After` headers when limits are breached.
  - Support tier-based dynamic quota limits.
- **Non-Functional Requirements**:
  - Low Latency: Sub-2ms rate limit verification per request.
  - High Availability: Rate limiter failure must gracefully fail-open to avoid blocking valid traffic.
  - Accurate Concurrency: Prevent race conditions across parallel application instances.

### System Architecture
```
[ Incoming API Request ] ---> [ API Gateway (Envoy / Kong) ]
                                           |
                                           v
                          [ Rate Limiter Middleware Filter ]
                                           |
                    +----------------------+----------------------+
                    | (Primary Redis Verification)               | (Redis Outage Fallback)
                    v                                             v
         [ Redis Cluster (Lua Script) ]                 [ Local Memory Rate Limiter ]
         (Atomic Token Bucket / Counter)                (Graceful Fail-Open)
```

### Rate Limiting Algorithms
| Algorithm | Mechanism | Pros | Cons |
|---|---|---|---|
| **Token Bucket** | Tokens added to bucket at rate R; request takes 1 token | Allows bursts up to bucket capacity B | Requires tracking timestamp + token count. |
| **Leaky Bucket** | Queue processes requests at constant leak rate | Smooths traffic spikes | Bursty requests are delayed in queue. |
| **Sliding Window Counter** | Weighted combination of previous and current window counts | Memory efficient; prevents edge burst double-counting | Approximation of exact sliding log. |

### Redis Atomic Lua Implementation
```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, window)
end
if current > limit then
    return 0
else
    return 1
end
```

### Key takeaway
Distributed rate limiters execute atomic Redis Lua scripts (Token Bucket / Sliding Window Counter) at the API Gateway layer, utilizing local memory fallbacks to fail-open gracefully during infrastructure outages.
