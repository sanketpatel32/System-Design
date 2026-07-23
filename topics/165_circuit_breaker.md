# Circuit Breaker

> **Category:** Reliability and Fault Tolerance

---

A circuit breaker = **stops calling a failing service** so it can recover, instead of
hammering it with retries.

### States
```
   CLOSED (normal)
        |
        | failure rate > threshold
        v
   OPEN (fail fast)
        |
        | after timeout
        v
   HALF-OPEN (probe)
        |
   +----+----+
   |         |
success   failure
   |         |
   v         v
CLOSED    OPEN
```

### How it works
1. **Closed**: requests flow normally. Track success/failure.
2. **Open**: if failure rate exceeds threshold (e.g. 50% of last 100), trip. All requests fail
   fast (no network call).
3. **Half-open**: after a cooldown, allow one probe. If it succeeds → close. If fails → reopen.

### Why
- **Protect the failing service**: it's overloaded; your calls make it worse.
- **Fail fast**: caller gets an immediate error instead of hanging.
- **Allow recovery**: give it breathing room.
- **Prevent cascading failure**: a slow downstream doesn't take you down.

### Configuration
- **Failure threshold**: e.g. 50% failures in last 100 requests.
- **Open duration**: 30s default.
- **Half-open probes**: 1 request, then evaluate.

### Libraries
- **Hystrix** (Netflix, deprecated but famous).
- **Resilience4j** (modern Java).
- **Polly** (.NET).
- **opossum** (Node.js).
- **gRPC**: built-in.

### Fallbacks
When the circuit is open, what does the caller do?
- Return cached data.
- Return default / degraded response.
- Return error (and let caller handle).

### Compared to retries
- Retries handle transient failures.
- Circuit breakers handle sustained failures.
- They complement: retry 1-2 times, then circuit-break.

### Key takeaway
Circuit breakers stop cascading failures by **failing fast** when a downstream is broken. Trip
on high failure rate, probe periodically to test recovery. Combine with retries (transient) +
fallbacks (degraded response).
