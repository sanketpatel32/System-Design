# Kafka Basics

> **Category:** Message Queues and Event Streaming

---

Apache Kafka = **a distributed, partitioned, replicated, append-only log**. Used for
streaming data, event sourcing, log aggregation, and as a message broker.

### Core concepts
- **Topic**: a named stream/category (e.g. `orders`, `user_events`).
- **Partition**: a topic is split into N partitions for parallelism.
- **Offset**: position of a message within a partition (monotonic).
- **Producer**: writes messages to a topic.
- **Consumer**: reads messages from partitions.
- **Consumer group**: a group shares partitions (one per consumer).
- **Broker**: a Kafka server.
- **Cluster**: multiple brokers.

### Architecture
```
Topic "orders" with 3 partitions:
  P0: [msg0, msg1, msg4, msg7, ...]
  P1: [msg2, msg3, msg5, msg8, ...]
  P2: [msg6, msg9, msg10, ...]

Each partition replicated across brokers (leader + followers).
```

### Key properties
- **Persistent**: messages stored on disk for days/weeks/forever.
- **Replayable**: consumers can re-read from any offset.
- **Ordered within partition**: not across partitions.
- **High throughput**: millions of messages/sec.
- **Scalable**: partitions → parallelism.

### Producers choose partition
- By key: `hash(key) % num_partitions` (same key → same partition → order).
- Round-robin if no key.

### Consumer groups
- Each partition assigned to one consumer in a group.
- Add consumers → parallelism up to #partitions.
- Different groups consume independently.

### Use cases
- **Event streaming** (user activity, IoT).
- **Event sourcing** (the source of truth is the log).
- **Log aggregation** (collect app logs).
- **Stream processing** (Kafka Streams, Flink).
- **CDC** (Debezium streams DB changes to Kafka).
- **Decoupling microservices**.

### Trade-offs
- ✅ High throughput, replayable, ordered (per partition).
- ✅ Multiple independent consumers.
- ❌ Operational complexity (clusters, monitoring).
- ❌ No per-message priority.
- ❌ Ordering only within partition.

### Key takeaway
Kafka is a **distributed log** optimized for high-throughput, replayable streaming. Partition for
parallelism, replicate for durability. Use it for event sourcing, CDC, log aggregation, and
decoupling microservices.
