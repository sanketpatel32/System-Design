# Design Distributed Queue

> **Category:** Advanced System Design Problems

---

Design a distributed queue like SQS.

### Requirements
- **Functional**: enqueue; dequeue; ACK; FIFO option; DLQ.
- **Non-functional**: durable; HA; at-least-once.

### Architecture
```
[Producer] -> [Queue service] -> [Consumers]
                 |
                 v
              [Storage (DB / log)]
```

### Storage
- **DB-backed**: rows with `visible_at`, `lock_token`.
- **Log-based** (Kafka): append-only with consumer offsets.

### Visibility timeout
- After dequeue: message hidden for N seconds.
- If not ACKed: becomes visible again.

### At-least-once
- Messages redelivered until ACK.
- Consumers must be idempotent.

### FIFO
- Standard queue: best-effort order, parallel consumers.
- FIFO queue: strict order, dedup by message ID.

### DLQ
- After max receive count → move to DLQ.

### HA
- Replicate queue data.
- Multiple queue brokers.

### Key takeaway
Distributed queue = durable storage + visibility timeout + at-least-once + DLQ. Standard
(parallel) vs FIFO (ordered). Consumers must be idempotent. SQS is the canonical example.
