# Exactly-Once Delivery

> **Category:** Message Queues and Event Streaming

---

Exactly-once delivery guarantees that each message is processed by the target system **exactly one time**—neither lost in transit nor executed multiple times. In distributed systems, this is achieved by combining **at-least-once delivery** with **idempotent processing** or **transactional coordination**.

### How It Works

Because network partitions guarantee that ACKs will eventually be lost, true network-level exactly-once transmission is impossible (the Two Generals' Problem). Systems achieve exactly-once processing end-to-end through atomic state updates and unique sequence identifiers.

```
+----------+   1. Publish Msg (ID: 101, Seq: 1)   +-------------------+   2. Check / Store   +------------------+
| Producer | -----------------------------------> | Kafka Broker / DB | -------------------> | Transaction Log  |
+----------+                                      +-------------------+                      +------------------+
     ^                                                      |                                         |
     |--- 3. ACK (ID: 101) ---------------------------------|                                         |
                                                            v                                         v
                                                  +-------------------+   4. Atomic Commit   +------------------+
                                                  | Consumer Service  | -------------------> | State DB (Key)   |
                                                  +-------------------+                      +------------------+
                                                    (Ignores dup 101)
```

### Architecture & Core Components

1. **Transactional Producer**: Assigns monotonic sequence numbers and producer IDs (PID) to all message batches.
2. **Broker Idempotent Log**: Broker detects duplicate sequence IDs per PID and rejects already-written entries.
3. **Transactional Coordinator**: Manages two-phase commit (2PC) markers across input offsets and output state topics (e.g., Kafka EOS).
4. **Idempotent Consumer / Deduplication Store**: Consumer tracks processed message IDs inside atomic transactions with local state stores.

### Implementation Strategies

| Approach | Mechanics | Latency Penalty | Storage Overhead | Example Technologies |
| :--- | :--- | :--- | :--- | :--- |
| **Distributed Transactions (2PC)** | XA / Two-Phase Commit across MQ & DB | High (Locking) | High | Apache ActiveMQ, IBM MQ |
| **Kafka EOS (Read-Committed)** | Transactional Coordinator + Control Markers | Low-Medium | Low | Apache Kafka, Flink |
| **Idempotent Consumer Engine** | Unique Key Constraint + UPSERT / DB Dedupe | Low | Medium | Redis, PostgreSQL, DynamoDB |

### Critical Edge Cases & Mitigation

- **Producer Retries on ACK Timeout**: Handled by Producer ID + Sequence Number matching at the broker.
- **Consumer Crashes Mid-Processing**: Handled by executing DB state update and offset commit within the same atomic SQL transaction.
- **Zombie Producers**: Fenced out using epoch numbers assigned by the cluster coordinator.

### Key takeaway

Exactly-once delivery is an **end-to-end processing guarantee**, not a magic network protocol. It requires combining at-least-once transport with atomic deduplication or transactional commit markers at the storage boundary.
