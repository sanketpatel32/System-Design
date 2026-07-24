# Exactly-Once Delivery

> **Category:** Message Queues and Event Streaming

---

Exactly-once delivery guarantees that a message is processed by the downstream system **exactly one time**, even in the presence of node failures, network partitions, retries, and duplicate requests. Achieving true exactly-once processing requires combining **idempotent message production** with **transactional read-process-write state management**.

### Core Architecture & Processing Pipeline

The end-to-end exactly-once stream processing pipeline relies on three main components: idempotent producers, atomic transaction markers in the log stream, and idempotent or transactional storage sinks.

```
+--------------------+        1. Produce with PID & SeqNum        +----------------------+        2. Atomic Transaction Commit        +--------------------+
|  Idempotent        | -----------------------------------------> | Transactional Log    | -----------------------------------------> | Transactional      |
|  Producer          |                                            | (Apache Kafka / Flink)|                                            | Sink / Database    |
+--------------------+                                            +----------------------+                                            +--------------------+
          |                                                                  |                                                                 |
   (Retries with PID)                                                  (2PC Markers / WAL)                                               (Upsert / Unique Key)
   --> Eliminates Dup Writes                                           --> Atomic State Commit                                           --> Exact-Once Result
```

### Protocol Mechanics & Guarantees

1. **Producer Idempotency**: The producer assigns a unique **Producer ID (PID)** and an increasing **Sequence Number** to every message chunk. The broker rejects duplicate sequence numbers per PID.
2. **Transactional Coordinator**: Manages atomic reads and writes across multiple partitions using Two-Phase Commit (2PC) protocol markers stored directly in the log.
3. **Consumer Read Isolation**: Downstream consumers are configured with `read_committed` isolation level, ensuring uncommitted or aborted transaction batches are filtered out and never presented to business logic.
4. **Idempotent Sinks**: Sinks write data using upserts (`INSERT ... ON CONFLICT DO UPDATE`) or atomic database transactions tied to the processing offset.

### Data Model & Transaction Metadata Schema

| Field Name | Data Type | Purpose & Constraint |
| :--- | :--- | :--- |
| `producer_id` | `INT64` | Unique identity assigned by transaction coordinator upon initialization |
| `producer_epoch` | `INT16` | Monotonically increasing epoch number to fence out zombie producers |
| `sequence_number` | `INT32` | Monotonically increasing per-partition sequence number for deduplication |
| `transaction_id` | `VARCHAR(128)` | User-configured logical identifier for cross-session idempotency |
| `transaction_status`| `ENUM` | Transaction state: `BEGIN`, `PREPARE_COMMIT`, `COMMITTED`, `ABORTED` |

### Delivery Guarantees Comparison Matrix

| Aspect | At-Most-Once | At-Least-Once | Exactly-Once |
| :--- | :--- | :--- | :--- |
| **Message Loss Risk** | Possible | Zero | Zero |
| **Duplicate Delivery Risk**| Zero | High | Zero |
| **Performance / Latency** | Highest (Lowest RTT) | Medium | Lower (Transactional Commit Overhead) |
| **Broker State Storage** | Ephemeral RAM | Write-Ahead Log (WAL) | Distributed WAL + Transaction State Log |
| **Implementation Cost** | Minimal | Medium (ACKs + Retries) | Complex (2PC + Fencing Tokens + Dedupe) |

### Key Trade-offs & Failure Recovery

- ✅ **Absolute Data Accuracy**: Eliminates phantom payments, double-billing, and distorted financial aggregates.
- ✅ **Deterministic State Recovery**: Stream processors (e.g., Apache Flink, Samza) can recover state from checkpoints deterministically.
- ❌ **Performance Latency**: Transaction commits introduce additional round trips and 2PC coordination latency.
- ❌ **Zombie Producer Edge Case**: Network partitions can leave old producers alive; system requires **Epoch-based Fencing Tokens** to reject requests from stale producers.
### Production Code Pattern (Kafka Transactional Producer)

```java
// Java Kafka Exactly-Once Transactional Producer
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("transactional.id", "order-processing-tx-01");
props.put("enable.idempotence", "true");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
producer.initTransactions();

try {
    producer.beginTransaction();
    producer.send(new ProducerRecord<>("orders-processed", orderId, payload));
    producer.sendOffsetsToTransaction(offsetsToCommit, consumerGroupId);
    producer.commitTransaction(); // 2PC Atomic Commit Marker Written to Log
} catch (ProducerFencedException e) {
    producer.close(); // Fenced out by newer epoch producer instance
} catch (KafkaException e) {
    producer.abortTransaction(); // Rollback local transaction state
}
```

### Edge Cases in Distributed Exactly-Once Processing

1. **Zombie Producers**: A partitioned producer instance wakes up from a long GC pause and attempts to complete a transaction. The Transaction Coordinator rejects the write using **Epoch-based Fencing Tokens**.
2. **Consumer Read Pollution**: Consumers reading with default `read_uncommitted` isolation level will process aborted transaction messages. Downstream services must configure `isolation.level = read_committed`.
3. **External Database Sink Conflicts**: Writing to external databases (e.g. MySQL) outside the Kafka transaction log requires **Two-Phase Commit (2PC) or Transactional Outbox Patterns** to maintain exactly-once guarantees.

### Key takeaway

Exactly-once processing is an **end-to-end property**, not just a messaging layer flag. It requires idempotent production, transactional state commits, and idempotent consumer storage working in concert.
