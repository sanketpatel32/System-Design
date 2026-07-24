# Design Distributed Queue

> **Category:** Distributed Systems Infrastructure

---

A Distributed Message Queue enables asynchronous communication and decoupled data transfer between distributed software components by buffering tasks and messages.

### System Requirements
- **Functional Requirements**:
  - Publish and consume messages asynchronously.
  - Support multiple consumer groups, message visibility timeouts, and dead-letter queues (DLQ).
  - Guarantee configurable message delivery semantics.
- **Non-Functional Requirements**:
  - High Availability: Uninterrupted message ingestion during broker failures.
  - Horizontal Scalability: Scale queue partitions and throughput linearly.
  - Durability: Persist messages to disk to prevent loss before consumer processing.

### System Architecture
```
[ Message Producers ] ---> [ API Gateway / Load Balancer ]
                                     |
                                     v
                        [ Queue Broker Cluster ]
  +----------------------------------+----------------------------------+
  |                                  |                                  |
  v                                  v                                  v
[ In-Memory Message Index ]   [ Persistent Disk Storage ]    [ In-Flight Visibility Timer ]
  |                                  |                                  |
  +----------------------------------+----------------------------------+
                                     |
                                     v
                        [ Consumer Group Workers ]
                                     | (On Repeated Max Retries)
                                     v
                        [ Dead-Letter Queue (DLQ) ]
```

### Delivery Guarantees & Messaging Models
| Delivery Guarantee | Technical Implementation | Trade-off |
|---|---|---|
| **At-Most-Once** | Ack message immediately upon dispatch to consumer | Fast; risk of lost messages if consumer crashes mid-processing. |
| **At-Least-Once** | Ack message only *after* consumer completes processing | Durable; consumers must be idempotent to handle duplicate deliveries. |
| **Exactly-Once** | Atomic transaction between consumer ack, storage state, and deduplication ID | Highest overhead; requires end-to-end transactional coordination. |

### Key takeaway
Distributed message queues decouple producer and consumer systems using persistent storage, visibility timeouts, and dead-letter queues (DLQ), relying on consumer idempotency to support scalable at-least-once delivery.
