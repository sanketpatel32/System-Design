# Kafka Basics

> **Category:** Message Queues and Event Streaming

---

**Apache Kafka** is a distributed event streaming platform designed for high-throughput, fault-tolerant, append-only log ingestion and stream processing. Unlike traditional message queues, Kafka persists messages to disk in ordered partitions and allows messages to be replayed by multiple consumer groups.

### Cluster architecture & partitions

```
                             +------------------------+
                             |     Kafka Cluster      |
                             +------------------------+
                                         |
                             +------------------------+
                             |    TOPIC: "User-Events"|
                             +------------------------+
                                 /                \
                       Partition 0                Partition 1
                 +-----------------------+  +-----------------------+
                 | [Msg 0] [Msg 1] [Msg 2|  | [Msg 0] [Msg 1] [Msg 2|
                 +-----------------------+  +-----------------------+
                             ^                          ^
                             |                          |
                     Consumer Group A           Consumer Group B
                     (Offset Pointer 2)         (Offset Pointer 1)
```

### Core concepts

1. **Topic & Partition**: A topic is a logical event stream split into physical **Partitions** distributed across cluster brokers. Partitions maintain strict message ordering using sequential offset numbers.
2. **Producer Partitioning**: Producers route events to specific partitions using key hashing (`hash(Key) % Partitions`). Events sharing the same key land on the same partition, guaranteeing strict ordering.
3. **Consumer Groups & Offsets**: Consumers belong to Consumer Groups. Each partition is assigned to exactly one consumer per group. Consumers track their progress in the stream using **Offsets**.
4. **Log Retention**: Kafka retains events on disk for a configured retention period (e.g., 7 days) regardless of consumption state, enabling historical replay.

### Kafka vs Traditional Message Queues

| Feature | Apache Kafka | Traditional MQ (RabbitMQ, SQS) |
| :--- | :--- | :--- |
| **Data Storage Model** | Append-only distributed commit log | In-memory queue with transient disk backing |
| **Message Deletion** | Retained based on time/size policy | Deleted immediately upon consumer ACK |
| **Message Ordering** | Guaranteed strictly within each partition | Guaranteed only in single-consumer queues |
| **Throughput Capacity** | Extremely High (Millions of events/sec) | Moderate to High (Tens of thousands/sec) |

### Key takeaway

Apache Kafka provides distributed event streaming using append-only partition logs. Leverage Kafka for high-throughput event logging, stream processing, and scenarios requiring event replay across multiple consumer groups.
