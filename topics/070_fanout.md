# Fanout

> **Category:** Scaling

---

**Fanout** describes the architectural process where a single incoming event, trigger, or API call is propagated to multiple downstream services, messaging queues, or target entities concurrently. Fanout is widely used in social media activity feeds, notification engines, and event-driven microservices architectures.

### System architecture

```
                            +--------------------+
                            |   Publisher Event  |
                            +--------------------+
                                      |
                                      v
                            +--------------------+
                            | Fanout Controller  |
                            +--------------------+
                                /     |      \
                      +--------+   +--+---+   +--------+
                      |            |          |        |
                      v            v          v        v
                 +---------+  +---------+  +---------+ +---------+
                 | Queue A |  | Queue B |  | Queue C | | Queue D |
                 +---------+  +---------+  +---------+ +---------+
                      |            |          |            |
                      v            v          v            v
                 +---------+  +---------+  +---------+ +---------+
                 | Push Svc|  | Email   |  | Analytics| | Feed Svc|
                 +---------+  +---------+  +---------+ +---------+
```

### Fanout execution models

1. **Fanout-on-Write (Push Model)**: When an event occurs, the publisher immediately writes the event payload directly into the recipient datastores or feeds.
2. **Fanout-on-Read (Pull Model)**: When an event occurs, it is stored only once in the author's outbox. When recipients access the system, they pull and aggregate updates from their followee feeds dynamically.
3. **Hybrid Model**: Fanout-on-Write for standard users (e.g., < 10,000 followers) combined with Fanout-on-Read for high-follower celebrity accounts to prevent system amplification spikes.

### Fanout model trade-offs

| Dimension | Fanout-on-Write (Push) | Fanout-on-Read (Pull) | Hybrid Model |
| :--- | :--- | :--- | :--- |
| **Write Cost** | High (O(N) writes per post) | Extremely Low (O(1) write per post) | Balanced (O(N) for normal users) |
| **Read Latency** | Extremely Fast (O(1) lookup) | Slow (O(K) queries for K followees) | Fast for all users |
| **Storage Usage** | High (Duplication across feeds) | Minimal (Single source of truth) | Moderate |
| **Celebrity Problem** | Catastrophic without caps | Handled naturally | Solves celebrity write spikes |

### Architectural fanout mechanisms

- **Publish-Subscribe Topics**: RabbitMQ Fanout Exchanges or SNS Topics broadcasting messages to multiple bound SQS queues.
- **Worker Pools**: Async worker clusters popping fanout events from message brokers and writing in parallel batches to storage nodes.

### Key takeaway

Fanout balances write amplification against read performance. Use Fanout-on-Write for immediate read responsiveness, Fanout-on-Read to avoid massive write spikes for high-volume publishers, or a hybrid model for scale.
