# Design Kafka

> **Category:** Advanced System Design Problems

---

Design Kafka: distributed, partitioned, replicated log.

### Requirements
- **Functional**: produce; consume; replay; multiple consumer groups.
- **Non-functional**: millions of msgs/sec; durable; replayable.

### Architecture
```
[Producer] -> [Broker] -> partitions (replicated)
                            ^
                            |
[Consumer groups] ----------+
```

### Topics + partitions
- Topic = category.
- Partition = ordered log.
- Producer picks partition (by key).
- Offset within partition.

### Replication
- Each partition has leader + followers.
- ISR (in-sync replicas).
- Leader fails → ISR member takes over.

### Consumer groups
- Each partition assigned to one consumer in group.
- Different groups consume independently.
- Offset tracked per group.

### Durability
- Messages persisted to disk.
- Configurable replication factor (3 typical).
- Acknowledgments: 0, 1, all.

### Performance
- Sequential disk writes (fast despite disk).
- Zero-copy transfer.
- Batching + compression.

### Exactly-once
- Producer idempotence + transactions across topics.

### Key takeaway
Kafka = partitioned + replicated log. Partition for parallelism, replicate for durability,
consumer groups for fanout. Sequential disk writes + zero-copy = millions of msgs/sec.
