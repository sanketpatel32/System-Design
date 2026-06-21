# Retries

> **Category:** Reliability and Fault Tolerance

---

Retries = **repeating a failed operation**, hoping it was transient. Powerful but dangerous
if done wrong.

### Why retry
- Network blips.
- Brief service degradation.
- Rate limiting (429 with Retry-After).
- Connection drops.

### When NOT to retry
- **4xx errors** (except 429): client error, won't fix on retry.
- **Permanent failures** (validation, business rule).
- **Idempotency unknown** for non-idempotent operations (could double-charge).

### Retry patterns

#### Fixed delay
```
retry after 1s, 1s, 1s
```
Simple, but thundering-herds the struggling service.

#### Exponential backoff
```
retry after 1s, 2s, 4s, 8s, 16s
```
Gives the service time to recover.

#### Exponential backoff + jitter
```
retry after random(1s, 2s), random(2s, 4s), random(4s, 8s), ...
```
Spreads retries so they don't synchronize.

### Retry budget / circuit breaker
- Don't retry forever.
- Cap at 3-5 attempts.
- Combine with circuit breaker (stop retrying if many fail).

### Idempotency
- At-least-once delivery + retries = duplicates.
- Use idempotency keys so retries are safe.

### Thundering herd
- 1000 clients retry simultaneously after an outage.
- Service gets crushed again.
- Fix: jitter + exponential backoff + circuit breakers.

### Where to retry
- **At the client**: SDK / library.
- **At the framework**: gRPC, Feign, Spring Retry.
- **At the queue**: SQS visibility timeout + DLQ.

### Real-world
- AWS SDK retries with exponential backoff + jitter by default.
- HTTP clients: typically retry on 5xx and connection errors.

### Key takeaway
Retry transient failures with **exponential backoff + jitter**, cap at 3-5 attempts. Combine
with circuit breaker (stop hammering broken services). Make operations idempotent so retries
are safe.
