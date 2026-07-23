# Message Queue Basics

> **Category:** Message Queues and Event Streaming

---

A message queue = **a buffer that decouples producers from consumers**. Producers push
messages; consumers pull them at their own pace.

### Why
- **Decouple** producers and consumers.
- **Absorb bursts** — queue holds backlog during traffic spikes.
- **Retry / DLQ** for failed messages.
- **Scale** consumers independently.
- **Async** processing.

### Basic model
```
[Producer] -> [Queue] -> [Consumer]
```
- Producer writes message to queue.
- Consumer reads (and ACKs) messages from queue.
- Queue persists messages until consumed.

### Properties
| Property | Meaning |
|----------|---------|
| Persistence | Messages survive broker restart |
| Ordering | FIFO within a queue (or partition) |
| Delivery | At-least-once, at-most-once, exactly-once |
| ACK | Consumer confirms processing |
| TTL | Messages expire if not consumed |
| DLQ | Failed messages go to dead-letter queue |

### Popular queues
| | Notes |
|--|-------|
| **RabbitMQ** | Classic, rich routing |
| **Amazon SQS** | Managed, simple |
| **ActiveMQ** | Open-source, JVM |
| **Kafka** | Log-based, streaming (see Kafka topic) |
| **Redis** | Lightweight, in-memory |
| **NATS** | Lightweight, fast |

### Patterns
- **Work queue**: distribute tasks to workers.
- **Pub/sub**: one message → many subscribers.
- **Request/reply**: RPC over a queue.
- **Routing**: route by topic, header.

### Trade-offs vs RPC
- ✅ Decoupling, burst absorption, retries.
- ❌ Operational complexity, harder debugging, eventual consistency.

### Key takeaway
Use a queue when you want to decouple producers from consumers, absorb bursts, retry failures,
or scale them independently. SQS/RabbitMQ for traditional queues; Kafka for streaming.
