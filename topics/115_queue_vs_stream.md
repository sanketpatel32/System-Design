# Queue vs Stream

> **Category:** Message Queues and Event Streaming

---

Understanding the differences between **Message Queues** (e.g., RabbitMQ, AWS SQS) and **Event Streams** (e.g., Apache Kafka, AWS Kinesis) is essential for designing event-driven systems. Message queues focus on ephemeral task distribution, while event streams focus on ordered, append-only event log persistence.

### Architectural comparison

```
 Message Queue Model (Ephemeral Task Delegation)
 Producer ---> [ Message Queue ] ---> Consumer A (Processes & Destroys Message)

 Event Stream Model (Immutable Replay Log)
 Producer ---> [ Partition Log: 0, 1, 2, 3... ] ---> Consumer Group 1 (Offset: 2)
                                              ---> Consumer Group 2 (Offset: 0 - Replay)
```

### Core Comparison Matrix

| Architectural Feature | Message Queue (SQS / RabbitMQ) | Event Stream (Kafka / Kinesis) |
| :--- | :--- | :--- |
| **Message Lifetime** | Ephemeral (Deleted immediately upon consumer ACK) | Persistent (Retained for fixed duration e.g., 7 days) |
| **State Tracking** | Managed by Broker | Managed by Consumer (Offset pointer) |
| **Consumer Model** | Competing Consumers (Each message handled once) | Multi-Group Pub-Sub (Each group gets all messages) |
| **Replayability** | Cannot replay deleted messages | Supports replaying historical events from any offset |
| **Ordering Guarantees**| Weak / Local queue ordering | Strict ordering within each stream partition |
| **Primary Use Cases** | Asynchronous task execution, email sending | Analytics pipelines, CDC, Event Sourcing, Audit logs |

### Choosing Between Them
Ask three questions about each workflow:

1. **May the message be destroyed after processing?** Yes → queue (email, image resize, webhook fan-out). No, it's a fact/record → stream (orders, clicks, sensor readings).
2. **Do multiple independent systems need the same events?** Yes → stream's consumer groups give each system its own offset over one shared log; with queues you'd need one queue (and one copy of the data) per consumer.
3. **Do consumers need history?** Replay, backfills, and new-consumer onboarding require retention → stream. A queue's answer to "re-send yesterday's message" is silence.

The two compose naturally: a stream is the durable source of truth, and lightweight queues hang off it (or off stream processors) for transient work distribution.

### Hybrid Patterns
| Pattern | How It Works | Example |
| :--- | :--- | :--- |
| **Stream + queue worker pools** | Stream feeds processors that enqueue fine-grained tasks. | Kafka → Flink → SQS per-user notification jobs. |
| **Queue with DLQ → audit stream** | Dead letters are forwarded to a stream for retention/replay. | RabbitMQ DLX → Kafka `dead-letters` topic. |
| **Outbox → stream (CDC)** | DB transactional outbox tails into the stream. | Postgres outbox → Debezium → Kafka. |
| **Stream replay → requeue** | Rewind offset to reprocess into queues. | Bug fix deployed → replay last 24h events. |

### Operational Differences Worth Knowing
- **Backpressure**: queues hit capacity limits and reject/slow producers; streams absorb bursts to disk and let consumers lag (lag becomes the key monitoring metric).
- **Ordering**: a queue's ordering is per-queue and fragile under redelivery; a stream's ordering is per-partition and durable — hash related keys to the same partition.
- **Cost shape**: queue pricing scales with requests; stream pricing scales with retained throughput-hours — replay-heavy workloads change the economics.

### Key takeaway

Select Message Queues for transient task processing where individual messages are discarded after execution. Select Event Streams when data must be retained, replayed, strictly ordered by partition, or consumed by multiple independent systems.
