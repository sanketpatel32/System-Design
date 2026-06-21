# Producer Consumer Pattern

> **Category:** Message Queues and Event Streaming

---

The producer-consumer pattern decouples **producers** (who create work) from **consumers**
(who process it) via a queue.

### Pattern
```
[Producer(s)] -> [Queue] -> [Consumer(s)]
```

### Why
- **Decouple rates**: producers and consumers can run at different speeds.
- **Absorb bursts**: queue holds backlog during spikes.
- **Parallel processing**: multiple consumers work in parallel.
- **Async**: producers don't wait.

### Variations

#### 1. Single producer, multiple consumers (worker pool)
```
1 producer -> queue -> 10 workers
```
- Tasks distributed round-robin.
- Each task processed by one worker.
- Example: image processing, video transcoding.

#### 2. Multiple producers, single consumer
```
10 producers -> queue -> 1 sequential consumer
```
- Serialize updates to a shared resource.

#### 3. Multiple producers, multiple consumers
```
10 producers -> queue -> 10 consumers
```
- High throughput both ends.

#### 4. Pipeline (multi-stage)
```
queue1 -> stage1 -> queue2 -> stage2 -> queue3 -> stage3
```
- Each stage scales independently.

### Implementation
- **In-process**: Python `queue.Queue` + threads.
- **Cross-process**: Redis, RabbitMQ, Kafka.
- **Cloud**: SQS, Pub/Sub, Kinesis.

### Backpressure
- If producers are faster than consumers, queue grows unboundedly.
- Solutions: bounded queue (block producers), shed load, scale consumers.

### Idempotency
- At-least-once delivery → consumers may get duplicates.
- Make consumers idempotent (idempotency keys, dedup).

### Key takeaway
Producer-consumer decouples rates and absorbs bursts. Use it whenever you have work that can be
processed asynchronously. Handle backpressure (bounded queue) and make consumers idempotent.
