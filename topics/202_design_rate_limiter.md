# Design Rate Limiter
> **Category:** Beginner System Design Problems

---

### Overview
A **Rate Limiter** controls the rate of traffic sent by a client or user to an API or network service. It limits the number of requests allowed within a specified timeframe (e.g., 100 requests per minute per IP), throttling excessive traffic with an **HTTP 429 Too Many Requests** response.

Rate limiters protect backend systems from DDoS attacks, brute-force login attempts, resource starvation (noisy neighbors), and cost overruns on expensive paid third-party APIs.

### System Architecture & Distributed Rate Limiter Topology

```
+--------------------+     1. Incoming HTTP Request      +--------------------+
| Client App / User  | --------------------------------> | API Gateway        |
+--------------------+                                   +--------------------+
         ^                                                         |
         | 4. HTTP 429 (If Exceeded)                               | 2. Atomic Rate Check
         +-------------------------------------------------------- | (Redis Lua Script)
                                                                   v
                                                         +--------------------+
                                                         | Redis Cluster      |
                                                         | (Token Bucket /    |
                                                         | Sliding Window)    |
                                                         +--------------------+
                                                                   |
                                                                   | 3. If Allowed -> Forward
                                                                   v
                                                         +--------------------+
                                                         | Microservice Nodes |
                                                         +--------------------+
```

### Rate Limiting Algorithms Comparison

| Algorithm | Operating Mechanism | Pros | Cons |
|---|---|---|---|
| **Token Bucket** | Bucket refilled with $R$ tokens/sec; request consumes 1 token. | Allows traffic bursts up to bucket capacity $B$; memory efficient. | Race conditions in distributed environments without Redis Lua scripts. |
| **Leaky Bucket** | Requests enter FIFO queue, processed at fixed constant rate. | Smooths out bursts; guarantees steady processing output rate. | Bursty traffic is queued or dropped if bucket overflows. |
| **Fixed Window Counter**| Divides time into fixed windows (e.g., 1 min); counts requests. | Simple to implement and low memory footprint. | Traffic spike at window boundaries can allow 2x limit. |
| **Sliding Window Counter**| Hybrid: combines current window count with weighted previous window. | Prevents edge traffic spikes; highly accurate; memory light. | Assumes uniform request distribution across previous window. |

### Distributed Redis Lua Script Execution
To execute atomic rate checking across distributed API Gateways without race conditions, rate limiters run **Redis Lua scripts**:

```lua
-- Keys: KEYS[1] = ratelimit_key
-- ARGV: ARGV[1] = limit, ARGV[2] = window_seconds, ARGV[3] = current_timestamp
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[2])
end
if current > tonumber(ARGV[1]) then
    return 0 -- Rejected
end
return 1 -- Allowed
```

### Rate Limiter Response Headers & API Specifications

| Response Header | Value Example | Description |
|---|---|---|
| `X-RateLimit-Limit` | `100` | Maximum allowed request limit within the configured window. |
| `X-RateLimit-Remaining`| `42` | Remaining quota tokens available in current window. |
| `X-RateLimit-Reset` | `1700000060` | Unix Epoch timestamp when current window resets. |
| `Retry-After` | `18` | Seconds client must wait before retrying after HTTP 429 response. |

### Data Model & Schema (Redis Keys)

| Key Pattern | Structure | TTL | Purpose |
|---|---|---|---|
| `rate:{user_id}:{endpoint}` | Redis Hash / Counter | Window Duration (e.g., 60s) | Tracks request counts for logged-in user accounts. |
| `rate:ip:{ip_address}` | Redis Counter | Window Duration | Tracks request counts for unauthenticated IP clients. |
| `rate:token_bucket:{id}` | Redis Hash | Expiration Timestamp | Stores `{tokens: 15, last_updated: 1700000000}` for Token Bucket. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **API Gateway Level Limiting** | Filters abusive requests before hitting backend microservice infrastructure. | Gateway cluster can become bottle-necked if Redis latency increases. | Enterprise microservices and public SaaS API platforms. |
| **Token Bucket Algorithm** | Supports natural traffic bursts while maintaining overall rate limit. | Slightly more complex state to persist in Redis than simple counters. | General-purpose REST and GraphQL APIs. |
| **Local In-Memory Cache vs Redis**| Sub-microsecond check speed with zero network hop. | Rate limits are enforced per node, causing inconsistent quotas across multi-node clusters. | Low-level rate limits on single instance microservices. |

### Key takeaway
**Rate Limiters** protect systems against overload by throttling excessive traffic with **HTTP 429 responses**. Use the **Token Bucket** or **Sliding Window Counter** algorithm implemented via **Redis Lua scripts** at the API Gateway to guarantee atomic, race-condition-free enforcement across distributed clusters.
