# Timeouts

> **Category:** Reliability and Fault Tolerance

---

A timeout = **an upper bound on how long you wait** for an operation. Without one, a slow
dependency takes you down with it.

### Why
- Network calls can hang forever.
- DB queries can deadlock.
- Downstream services can degrade.
- Without timeouts, your threads/connections fill up waiting → cascading failure.

### The cascading failure scenario
```
1. Service B gets slow (DB issue).
2. Service A waits for B... and waits... and waits.
3. A's connection pool fills with waiting threads.
4. A can't serve other requests.
5. C, D, E (depend on A) also stall.
6. Entire system down.
```

### Setting timeouts
- **Conservative default**: 1-5s for normal API calls.
- **Tight for critical paths**: 100-500ms.
- **Generous for batch**: 30-60s.
- Always set: connect timeout + read timeout.

### Per-call timeouts
| Call type | Typical timeout |
|-----------|-----------------|
| DB query | 1-5s |
| Cache (Redis) | 100-500ms |
| HTTP API call | 1-3s |
| gRPC | 1-5s |
| External webhook | 5-10s |
| Background job | minutes |

### Timeout budget
- Total request timeout = sum of downstream timeouts.
- Each downstream gets a fraction of the budget.
- Example: 1s total → DB 200ms + cache 100ms + downstream 500ms.

### Implementations
- HTTP clients (requests, axios): `timeout=2.0`.
- DB drivers: `statement_timeout` (Postgres).
- gRPC: per-call deadline propagation.
- Circuit breakers: complementary (stop calling failing services).

### Failure modes
- **Too short**: false positives, retries, waste.
- **Too long**: cascading failures.
- **No timeout**: catastrophic.

### Key takeaway
**Every network call needs a timeout.** Set them based on the operation's expected latency.
Build a timeout budget: total request budget allocated across downstreams. Combined with retries
+ circuit breakers, timeouts prevent cascading failures.
