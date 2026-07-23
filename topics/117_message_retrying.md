# Message Retrying

> **Category:** Message Queues and Event Streaming

---

Retries handle transient failures in consumers — but they must be done carefully to avoid
infinite loops and side effects.

### Why retry
- Network blips.
- DB temporarily down.
- Downstream rate-limited (429).
- Bug being deployed right now.

### Retry strategies
| Strategy | How |
|----------|-----|
| **Immediate** | Retry right away |
| **Fixed delay** | Wait N seconds between attempts |
| **Exponential backoff** | 1s, 2s, 4s, 8s, 16s, ... |
| **Exponential + jitter** | Add randomness to avoid thundering herd |
| **DLQ after N attempts** | Give up, send to dead-letter |

### Exponential backoff + jitter (recommended)
```
delay = min(max_delay, base * 2^attempt) * random(0.5, 1.0)
```
- Backoff: don't hammer a struggling service.
- Jitter: spread retries so they don't synchronize.

### Idempotency is mandatory
- At-least-once delivery → consumers may receive duplicates.
- Idempotency key → safe to retry.

### Visibility timeout (SQS)
- Message becomes invisible after delivery.
- If not ACK'd in N seconds, it's re-delivered.
- Sets the upper bound on processing time per attempt.

### Retry queues (RabbitMQ)
- Failed message → retry queue with TTL.
- After TTL expires → back to main queue.
- After N attempts → DLQ.

### When NOT to retry
- Permanent failures (invalid input, business rule violation).
- Send straight to DLQ.
- Don't retry a 400 (client error).

### Poison messages
- A message that always fails (bug, malformed).
- Will retry forever without a cap.
- Always have **max attempts + DLQ**.

### Key takeaway
Retry with **exponential backoff + jitter**, cap at N attempts, send failures to a **DLQ**.
Consumers must be **idempotent** (at-least-once means duplicates). Don't retry permanent
errors.
