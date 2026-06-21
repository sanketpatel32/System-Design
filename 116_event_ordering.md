# Event Ordering

> **Category:** Message Queues and Event Streaming

---

Event ordering = **guaranteeing events are processed in the order they occurred.** Hard in
distributed systems.

### Why ordering matters
- Update profile → delete account. If reversed, account is recreated.
- Cart add → checkout → payment. Reverse order breaks checkout.
- Status changes: pending → paid → shipped. Out-of-order corrupts state machines.

### Levels of ordering

#### 1. Per partition (Kafka)
- Messages in the same partition are delivered in order.
- Different partitions may be processed out of order.
- Choose partition key = entity ID (e.g. `user_id`) to keep one entity's events in order.

#### 2. Per queue (RabbitMQ, SQS FIFO)
- All messages in one queue processed in order.
- Limits parallelism (one consumer at a time, or careful batching).

#### 3. Global ordering
- All events in the entire system ordered. Extremely expensive.
- Achieved by single partition / single queue → no parallelism.

### Trade-off: ordering vs parallelism
```
1 partition:  fully ordered, single-consumer throughput
N partitions: ordered within key, parallel processing
```
Most systems order **per key**, sacrificing global order for parallelism.

### Handling out-of-order in consumers
- **Version / timestamp**: consumer rejects older events.
- **State machine**: only accept valid transitions (paid → shipped OK; paid → pending rejected).
- **Sequence numbers**: per-producer monotonic counter.

### Kafka pattern
- Partition by `entity_id` → all of one entity's events in order.
- Consumer processes sequentially per partition.

### Example: bank account
```
Partition key: account_id
Events for account 123: deposit 100, withdraw 50, deposit 200
All in same partition → processed in order
```

### Key takeaway
Global ordering kills throughput. **Partition by entity ID** to get per-entity ordering while
keeping parallelism. In consumers, reject out-of-order events via versions or state-machine
checks.
