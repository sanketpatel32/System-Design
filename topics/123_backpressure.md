# Backpressure

> **Category:** Message Queues and Event Streaming

---

Backpressure is a flow-control mechanism that allows a downstream service or consumer to **signal its capacity limit** to an upstream producer, preventing memory exhaustion, high latency, or system failure under load spikes.

### How It Works

When a consumer cannot process incoming data at the arrival rate, backpressure mechanisms propagate signals backward along the execution path to slow down or halt the producer.

```
+--------------+    Data Stream (Fast Rate: 10k rps)    +--------------+    Data Stream (Slow Rate: 1k rps)    +--------------+
|  Producer    | =====================================> | Intermediate | ====================================> |   Consumer   |
|              | <------------------------------------- |    Buffer    | <------------------------------------ | (Overloaded) |
+--------------+        Pause / Throttle Signal         +--------------+        Credit-Based Flow Control      +--------------+
```

### Backpressure Handling Strategies

| Strategy | Behavior Under Overload | Data Integrity | Memory Usage | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Control Signal (Pull)** | Consumer requests N items when ready | No Data Loss | Bounded | Reactive Streams, Kafka Pull |
| **Buffering (Queueing)** | Holds excess messages in memory/disk | Preserved until full | Unbounded risk | Message Brokers (RabbitMQ) |
| **Dropping (Shedding)** | Discards new incoming items (Latest/Oldest)| Lossy | Fixed Bounded | Live Video, Real-Time Audio |
| **Rejection (Block/Error)**| Returns HTTP 429 / Rate Limit error | Retried by Sender | Minimal | REST APIs, Gateways |

### Implementation Protocols & Patterns

1. **Reactive Streams (RSocket / RxJava)**: Uses a credit-based `request(n)` protocol where consumers explicitly request `n` items from publishers.
2. **TCP Window Size**: Transport-layer flow control dynamically adjusts the sender's sliding window based on the receiver's socket buffer.
3. **Kafka Pull Architecture**: Consumers poll the broker for data only when worker threads are idle, naturally exerting backpressure on brokers.

### Trade-offs & Common Pitfalls

- **Unbounded Queueing**: Storing infinite spikes in memory leads to `OutOfMemoryError` (OOM) crashes and high GC pauses.
- **Cascading Timeouts**: Upstream callers waiting on blocked producers can time out, triggering widespread retry storms.
- **Thread Exhaustion**: Blocking caller threads waiting for consumer capacity drains worker thread pools.

### Key takeaway

Backpressure prevents fast producers from destroying slow consumers. Build system pipelines using **pull-based consumption or explicit flow-control signals** rather than relying on unbounded buffers.
