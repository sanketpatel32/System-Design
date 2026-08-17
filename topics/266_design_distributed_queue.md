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

### Partitioning & Consumer Groups
- **Queue vs topic fan-out**: a *queue* load-balances messages across workers in one group; a *topic* (Kafka-style log) delivers every message to *each* subscribed group — independent offsets per group, replayable history.
- **Partition assignment**: messages hash by key to a partition (ordering guaranteed per key, not globally); workers claim partitions via a group coordinator with rebalancing on membership changes.
- **Rebalance storms**: a slow or flapping worker triggers group-wide partition reassignment, pausing consumption — cooperative (incremental) rebalancing and static membership mitigate this.

### Visibility Timeout Mechanics (Queue-Style)
```
consumer receives msg ──> visibility timeout T (e.g., 30s) starts
     ├── ack within T ──> message deleted
     └── no ack by T  ──> message becomes visible again → redelivered
                          (retryCount++ → at max → DLQ)
```
- **Idempotency is mandatory**: at-least-once redelivery means consumers see duplicates; dedupe by message ID with a short-TTL seen-cache.
- **Poison messages**: a message that crashes every consumer would loop forever without the retry counter — the DLQ plus an ops dashboard (and alarm on DLQ depth) is the safety valve.
- **Long tasks**: extend visibility periodically (heartbeat renewals) rather than setting a giant initial timeout that delays redelivery after a genuine crash.

### Durability & Ordering Trade-offs
| Choice | Consequence |
|---|---|
| **Ack before fsync** | Highest throughput, loses messages on broker disk loss. |
| **Replicated ack (min ISR)** | Survives broker failure; latency of the slowest replica. |
| **Strict global ordering** | Single partition = no parallelism; per-key ordering is the practical compromise. |
| **In-memory only** (Redis lists) | Fine for transient work; pair with persistence for anything billed. |

### Key takeaway
Distributed message queues decouple producer and consumer systems using persistent storage, visibility timeouts, and dead-letter queues (DLQ), relying on consumer idempotency to support scalable at-least-once delivery.
