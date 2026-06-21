# Backpressure

> **Category:** Message Queues and Event Streaming

---

Backpressure = **when a downstream component is slower than upstream, the upstream must
slow down, buffer, or shed load.** Without it, queues explode and systems crash.

### The problem
```
Producer (10k msg/s) -> Queue -> Consumer (1k msg/s)
```
- Queue grows by 9k msg/s.
- Eventually OOM, disk full, or unacceptable latency.

### Strategies

#### 1. Block (lossless)
- Producer waits when queue is full.
- Producer slows down naturally.
- Example: blocking queue in code.

#### 2. Buffer (bounded)
- Queue holds up to N messages.
- When full → block, drop, or shed.

#### 3. Drop (lossy)
- Drop oldest / newest / random.
- Used when freshness matters more than completeness (live video, telemetry).

#### 4. Shed load
- Reject new requests with 429 / 503.
- Client retries later.

#### 5. Scale out
- Add consumers.
- Doesn't help if downstream is the bottleneck.

#### 6. Sample / aggregate
- Reduce volume (aggregate metrics, sample logs).

### Reactive streams
- A protocol where consumer "pulls" from producer, signaling capacity.
- Consumer says "give me N more" — natural backpressure.
- Used in Akka, Project Reactor, RxJava.

### Real-world
- **Kafka**: consumer pulls at its own pace (natural backpressure).
- **HTTP servers**: limit concurrent connections, return 503 when full.
- **TCP**: window-based flow control (receiver signals sender).

### Symptoms of missing backpressure
- Queue depth grows unboundedly.
- Memory pressure → OOM.
- Latency grows (messages wait in queue).
- Cascading failures.

### Key takeaway
Design every pipeline with **backpressure** — bounded queues, drop policy, or flow control. Let
consumers "pull" rather than being "pushed." Without backpressure, a slow downstream causes
upstream OOM and cascading failure.
