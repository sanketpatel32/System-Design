# Queue vs Stream

> **Category:** Message Queues and Event Streaming

---

Queues and streams are both async messaging, but with different semantics.

### Queue (RabbitMQ, SQS)
- **Consume-and-delete**: message removed after ACK.
- **One consumer** per message (within a queue).
- **No replay**: once gone, gone.
- **Work distribution**: load balance among workers.
```
Producer -> [Queue] -> Worker A (msg 1)
                     \-> Worker B (msg 2)
                     \-> Worker C (msg 3)
```

### Stream (Kafka, Kinesis)
- **Append-only log**: messages stay for days/forever.
- **Multiple consumers** read independently at their own offset.
- **Replayable**: rewind to any point.
- **Event log**: source of truth.
```
Producer -> [Stream partition] -> Consumer A (reads from offset 100)
                              \-> Consumer B (reads from offset 50)
                              \-> Consumer C (replays from 0)
```

### Comparison
| | Queue | Stream |
|--|-------|--------|
| Retention | Until consumed | Configurable (days/forever) |
| Replay | No | Yes |
| Consumers per message | One | Many (independent offsets) |
| Ordering | Per queue | Per partition |
| Use case | Task distribution | Event log, streaming |
| Throughput | Medium | High |
| Examples | RabbitMQ, SQS | Kafka, Kinesis |

### When to use queue
- Task distribution (work pool).
- Transient commands ("send email", "resize image").
- Don't need replay.

### When to use stream
- Event sourcing (the log is the truth).
- Multiple independent consumers (analytics, audit, search index).
- Replay needed (re-process historical data).
- High throughput.

### Hybrid
- Use Kafka (stream) as the backbone.
- Bridge to RabbitMQ / SQS for specific work-queue needs.

### Key takeaway
**Queues** are for transient work distribution (consume-and-delete). **Streams** are persistent
logs (replayable, multiple consumers). Pick by retention + replay + fanout needs.
