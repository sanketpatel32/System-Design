# Event Ordering

> **Category:** Message Queues and Event Streaming

---

**Event Ordering** ensures that events in a distributed system are processed in the exact sequence in which they occurred. In distributed event-driven architectures, preserving order across asynchronous networks and concurrent worker threads is a critical challenge.

### Partition key ordering architecture

```
                     +-----------------------------------+
                     |      Producer Application         |
                     +-----------------------------------+
                                       |
                       Partition Key = "user_id_101"
                                       v
                     +-----------------------------------+
                     | Kafka Partition 2 (Ordered Log)   |
                     | [Event 1: Created] -> [Event 2: Paid] -> [Event 3: Shipped]
                     +-----------------------------------+
                                       |
                       Single Consumer Worker Assignment
                                       v
                     +-----------------------------------+
                     | Consumer Worker (Strict Order Execution)
                     +-----------------------------------+
```

### Strategies for maintaining event order

1. **Partitioning by Entity Key**: Route all events related to a specific entity (e.g., `order_id` or `user_id`) to the same partition using deterministic hash keys (`hash(user_id) % Partitions`). Since a single partition is processed by a single consumer thread, order is strictly preserved per entity.
2. **Single Consumer / Single Queue**: Restrict processing to a single queue and single consumer instance. *Guarantees total global ordering, but eliminates horizontal concurrency.*
3. **Sequence Numbers & Logical Clocks**: Attach monotonically increasing sequence numbers or Lamport Timestamps to events. Consumers buffer out-of-order events and reorder them before processing.

### Event Ordering Strategy Comparison

| Strategy | Ordering Guarantee | Processing Concurrency | Failure Recovery Risk |
| :--- | :--- | :--- | :--- |
| **Global Single Queue** | Total global order across all entities | Extremely Low (O(1) consumer node bottleneck) | Consumer failure halts entire system pipeline |
| **Partition Key Hashing**| Strict order per entity key (e.g., `user_id`) | High (Concurrently scales across N partitions) | Hot partition if key distribution is skewed |
| **App Sequence Buffering**| App reorders out-of-sequence events | High | Memory buffer overflow if an event is delayed |

### Key takeaway

Achieve event ordering by partitioning event streams using an entity key (e.g., `user_id`). This preserves strict event sequence per entity while allowing horizontal processing across partitions.
