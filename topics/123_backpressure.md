# Backpressure

> **Category:** Message Queues and Event Streaming

---

Backpressure is a feedback mechanism in distributed systems where a downstream consumer signals an upstream producer to **slow down or temporarily suspend data transmission**. It prevents fast producers from overwhelming slow consumers, avoiding out-of-memory (OOM) crashes, buffer saturation, and cascading system failures.

### Core Concept & Flow Control Architecture

When consumer processing capacity drops below producer output rate, intermediate queues fill up. Once high-watermark thresholds are crossed, backpressure flow signals propagate upstream.

```
+------------------+         Push Data Rate: 10,000 req/s        +------------------+        Pull Data Rate: 1,000 req/s        +------------------+
|  Fast Producer   | ==========================================> |  Buffer / Queue  | ========================================> |  Slow Consumer   |
+------------------+                                             +------------------+                                           +------------------+
         ^                                                                |                                                              |
         |                                                       (Queue Size > 80%)                                                    (High CPU / DB Lock)
         +----------------------------------------------------------------+                                                              |
                          Backpressure Signal (Pause / Slow Down)                                                                       |
```

### Backpressure Handling Strategies

1. **Reactive Pull-Based Streaming (Credit/Demand Based)**: Consumers explicitly request $N$ items from producers (`request(n)` in Reactive Streams / RxJava / Project Reactor). Producers only send requested capacity.
2. **Blocking / Throttling**: The producer's send thread is blocked on a bounded queue (e.g., Java `ArrayBlockingQueue`) or TCP socket window until space opens up.
3. **Shedding / Dropping (Load Shedding)**: Excess messages are immediately dropped or sent to a Dead-Letter Queue (DLQ) when the queue fills.
4. **Buffering / Offloading**: Messages are temporary offloaded to persistent disk stores (e.g., Kafka log segments) to absorb producer spikes.

### Protocol-Level Flow Control Mechanisms Matrix

| Mechanism / Protocol | How Flow Control is Signal | Action Taken When Congested | Primary Application |
| :--- | :--- | :--- | :--- |
| **TCP Sliding Window** | Receiver advertises `Window Size = 0` in TCP Header | Sender stops transmitting packets | Transport Layer (Layer 4) |
| **HTTP/2 Flow Control** | Sender receives `WINDOW_UPDATE` frames | Sender restricts HTTP/2 stream multiplexing | Application Protocols / gRPC |
| **Reactive Streams** | Consumer calls `Subscription.request(n)` | Producer limits emission to requested $n$ items | In-Memory Async Streams (RxJava) |
| **Message Queue Consumer** | Consumer pulls messages on demand (`poll()`) | Unconsumed messages remain in broker queue | Kafka, RabbitMQ, Pulsar |

### System Implementation & Metrics Monitoring

- **High-Watermark & Low-Watermark**: Set high watermark (e.g., 80% capacity) to trigger pause/slowdown signals, and low watermark (e.g., 30% capacity) to resume production.
- **Queue Saturation Metric**: Track `queue_capacity_used_ratio` and `consumer_lag`.
- **Latency Propagation**: If a downstream database stalls, backpressure ensures latency propagates up to the API Gateway, returning `429 Too Many Requests` or `503 Service Unavailable` instead of OOM crashing worker processes.

### Trade-offs & Edge Cases

- ✅ **System Resilience & Stability**: Prevents catastrophic process crashes due to memory exhaustion.
- ✅ **Graceful Degradation**: Protects backend dependencies by converting traffic spikes into bounded queue delays.
- ❌ **Cascading Latency**: Latency accumulates at the edge if consumers remain bottlenecked for extended periods.
- ❌ **Deadlock Risk**: In bi-directional streaming pipelines, improper backpressure coordination can result in circular waiting deadlocks.
### Reactive Streams Credit-Based Code Example (Project Reactor)

```java
// Java Project Reactor Credit-Based Pull Backpressure
Flux.range(1, 1000000)
    .log()
    .subscribe(new Subscriber<Integer>() {
        private Subscription subscription;
        private int processedCount = 0;

        @Override
        public void onSubscribe(Subscription s) {
            this.subscription = s;
            subscription.request(10); // Request initial batch of 10 items
        }

        @Override
        public void onNext(Integer integer) {
            processItem(integer);
            processedCount++;
            if (processedCount % 10 == 0) {
                subscription.request(10); // Ask for next 10 items only when ready!
            }
        }

        @Override public void onError(Throwable t) { t.printStackTrace(); }
        @Override public void onComplete() { System.out.println("Stream Completed"); }
    });
```

### Production Edge Cases & Deadlock Risks

1. **Cascading Backpressure Stalls**: If the database stalls, backpressure propagates upstream to worker pools, thread queues, and API gateways. If gateway timeouts drop requests while backend queues are still full, resources remain tied up executing orphaned requests.
2. **Circular Backpressure Deadlocks**: In complex DAG stream topologies, if Service A feeds Service B and Service B pushes control messages back to Service A over a shared TCP connection, mutual backpressure blocking can deadlock both services.

### Key takeaway

Backpressure transforms system overload from **uncontrolled process crashes** into **managed queue delay or explicit rate limiting**, preserving system availability under heavy traffic.
