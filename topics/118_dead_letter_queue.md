# Dead Letter Queue

> **Category:** Message Queues and Event Streaming

---

A dead-letter queue (DLQ) = **a queue where messages go after failing processing N times**,
so they don't block the main flow.

### Why
- Bad messages (malformed, bug) would otherwise retry forever.
- DLQ isolates them for inspection / manual handling.

### Flow
```
[Main Queue] -> [Consumer] --success--> ACK
                          \--fail x N--> [DLQ]
```

### How it's configured
- **Max receive count** (e.g. 3 attempts) → then DLQ.
- **Visibility timeout**: per-attempt window.
- **DLQ is just another queue**.

### In SQS
- Configure redrive policy: source queue → DLQ after maxReceiveCount.

### In RabbitMQ
- DLX (dead-letter exchange): failed messages routed to it.

### In Kafka
- No built-in DLQ. Application-level: produce failed records to a DLQ topic.

### Operating a DLQ
- **Monitor DLQ depth** — alerts if it grows.
- **Inspect**: why did messages fail?
- **Replay**: fix bug, reprocess DLQ into main queue.
- **Discard**: if message is genuinely bad, drop after analysis.

### Common patterns
- **Quarantine** bad messages, fix, replay.
- **Metrics** on failure rate by error type.
- **TTL on DLQ** to bound storage.

### Key takeaway
Every queue needs a **DLQ + max retry count** to prevent poison messages from blocking the main
flow. Monitor DLQ depth, inspect failures, fix root cause, replay or discard.
