# Synchronous vs Asynchronous Communication

> **Category:** Message Queues and Event Streaming

---

Two styles of communication between services.

### Synchronous
- Caller **waits** for response before continuing.
- Examples: HTTP, gRPC (unary), function calls.
```
Client -> POST /charge -> Server
Client <- 200 OK <------- Server  (blocks until response)
```

### Asynchronous
- Caller **doesn't wait**. Sends a message, moves on.
- Examples: message queues, pub/sub, email, webhooks.
```
Client -> produce message -> [Queue]
Client <- ack immediately      |
                                v
                          [Worker] (later)
```

### Comparison
| | Sync | Async |
|--|------|-------|
| Coupling | Tight (caller needs callee up) | Loose (decoupled) |
| Latency | Caller waits | Caller moves on |
| Scalability | Limited by slowest callee | Better (buffer bursts) |
| Failure | Caller fails with callee | Caller always succeeds |
| Complexity | Simple to reason | More complex (events, retries) |
| Feedback | Immediate | Delayed |

### When to use sync
- Need response now to proceed.
- Simple request/response.
- User waiting (UI).
- Strong consistency required.

### When to use async
- Long-running operations.
- Bursty traffic (queues absorb spikes).
- Fanout (one event → many consumers).
- Decoupling producers/consumers.
- Notifications, emails, analytics.

### Hybrid pattern
- Sync for the user-facing path.
- Async for everything else (notifications, indexing, analytics).

### Example: e-commerce checkout
```
Sync:    charge credit card (must know if it succeeded)
Async:   send confirmation email, update inventory, log analytics
```

### Key takeaway
Default to **async** for non-critical paths (notifications, indexing, analytics) and **sync**
for paths where the caller needs the result. The mix is normal — use both, with clear
boundaries.
