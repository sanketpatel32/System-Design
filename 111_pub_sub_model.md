# Pub/Sub Model

> **Category:** Message Queues and Event Streaming

---

Pub/Sub (Publish/Subscribe) = **producers publish messages to topics; multiple subscribers
receive them independently.** Decouples producers from many consumers.

### Model
```
[Producer] --publish--> [Topic] --deliver--> [Subscriber A]
                                  \---> [Subscriber B]
                                  \---> [Subscriber C]
```
Each subscriber gets its own copy of each message.

### vs Point-to-Point Queue
| | Queue (P2P) | Pub/Sub |
|--|-------------|---------|
| Consumers | One per message | Many per message |
| Use case | Task distribution | Event broadcast |
| Example | Worker pool | Notifications |

### Why
- **Fanout**: one event → many systems.
- **Decoupling**: producer doesn't know who consumes.
- **Independent scaling**: each consumer scales separately.
- **Easy to add consumers** without touching producer.

### Use cases
- Notification fanout (one event → email + push + SMS + in-app).
- Audit logging (every event → log service).
- Real-time updates (push to multiple UIs).
- Cache invalidation (one update → many caches).
- Microservice choreography (each service reacts to events).

### Popular implementations
- **Kafka** (log-based, persistent, replayable).
- **Google Pub/Sub** (managed, at-least-once).
- **AWS SNS + SQS** (SNS fans out, SQS buffers per consumer).
- **RabbitMQ topic exchanges**.
- **Redis Pub/Sub** (fire-and-forget, no persistence).

### Delivery semantics
- **At-least-once** (most common) → consumers must be idempotent.
- **At-most-once** → fire-and-forget.
- **Exactly-once** → rare, expensive (Kafka transactions).

### Pattern: SNS → SQS fanout
```
Producer -> SNS topic -> SQS-A (email worker)
                       -> SQS-B (push worker)
                       -> SQS-C (analytics)
```
Each SQS queue is independent, retryable, durable.

### Key takeaway
Pub/Sub decouples producers from many consumers. Use it for fanout (notifications, audit,
invalidation). Each consumer should be **idempotent** (at-least-once delivery means duplicates).
