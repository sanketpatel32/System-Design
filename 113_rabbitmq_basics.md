# RabbitMQ Basics

> **Category:** Message Queues and Event Streaming

---

RabbitMQ = a classic **message broker** implementing AMQP. Rich routing, traditional
queue/pub-sub patterns.

### Core concepts
- **Producer**: publishes messages.
- **Exchange**: receives messages, routes to queues.
- **Queue**: stores messages until consumed.
- **Binding**: a rule connecting exchange to queue.
- **Consumer**: subscribes to a queue.

### Message flow
```
Producer -> Exchange -> (binding rules) -> Queue(s) -> Consumer
```

### Exchange types
| Type | Routing |
|------|---------|
| **Direct** | Routing key matches queue binding exactly |
| **Topic** | Routing key matches pattern (e.g. `orders.*.paid`) |
| **Fanout** | Broadcast to all bound queues |
| **Headers** | Route by message headers |

### Features
- **ACK**: consumer ACKs after processing; unacked on crash → requeued.
- **Persistence**: messages and queues can survive broker restart.
- **Prefetch**: limit unacked per consumer (fair dispatch).
- **TTL**: messages expire.
- **DLX**: dead-letter exchange for failed messages.
- **Priority queues**.
- **Confirms**: producer gets ACK that broker received.

### vs Kafka
| | RabbitMQ | Kafka |
|--|----------|-------|
| Model | Smart broker, dumb consumer | Dumb broker, smart consumer |
| Persistence | Optional per message | Always (log) |
| Replay | No (consume-and-delete) | Yes (read from offset) |
| Throughput | ~50k msgs/sec | Millions/sec |
| Routing | Rich (exchanges) | Topic-only |
| Ordering | Per queue | Per partition |
| Best for | Traditional queues, routing | Streaming, log, event sourcing |

### When to use RabbitMQ
- Classic work queues (task distribution).
- Rich routing (topics, headers).
- Low latency per message.
- Push-based (consumer gets notified).
- Traditional enterprise messaging.

### Trade-offs
- ✅ Rich routing, low latency, push-based.
- ❌ Lower throughput than Kafka.
- ❌ No replay (messages deleted after ACK).
- ❌ Operational complexity (clustering).

### Key takeaway
RabbitMQ is great for **traditional message routing** — work queues, pub/sub with rich routing
rules, RPC-over-queues. For streaming/replay/high-throughput, Kafka is better. They're
complementary tools.
