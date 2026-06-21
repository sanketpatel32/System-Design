# Design Distributed Rate Limiter

> **Category:** Advanced System Design Problems

---

Design a rate limiter that works across multiple instances.

### Requirements
- **Functional**: per-client rate limit across all instances.
- **Non-functional**: <1ms check; accurate; HA.

### Single-instance
- In-memory counter.
- Fast but per-instance (clients can exceed by N×).

### Distributed
```
[App 1] \
[App 2] --> [Rate limit service] -> [Redis (shared counters)]
[App 3] /
```

### Redis Lua (atomic)
```lua
local key = KEYS[1]
local count = redis.call('incr', key)
if count == 1 then
    redis.call('expire', key, 60)
end
if count > LIMIT then
    return 0  -- deny
else
    return 1  -- allow
end
```

### Token bucket
- Atomic check-and-decrement via Lua.
- Refill rate via background or on-access.

### Performance
- Redis is fast (<1ms).
- Network hop adds latency.

### Local + global hybrid
- Each instance has local token bucket (approximation).
- Periodically sync with global Redis.
- Less accurate but lower latency.

### HA
- Redis cluster (multi-AZ).
- Fall back to local limits if Redis down.

### Key takeaway
Distributed rate limiter = shared Redis + atomic Lua scripts. For lower latency, hybrid (local
bucket + periodic global sync). Fall back to local limits on Redis failure to stay available.
