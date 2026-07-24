# At-Most-Once Delivery

> **Category:** Message Queues and Event Streaming

---

At-most-once delivery is a messaging guarantee where a message is delivered **at most one time** (0 or 1 times). Under this model, message loss is acceptable, but duplicate delivery is strictly prevented. The system makes no retries, holds no persistent acknowledgments, and prioritizes raw throughput and ultra-low latency over data durability.

### Core Architecture & Delivery Flow

In an at-most-once architecture, the producer writes data directly into the transport channel (e.g., socket buffer or UDP socket) and immediately returns control to the caller without waiting for confirmation from the broker or downstream consumer.

```
+----------+       1. Push Message (Fire-and-Forget)       +----------------+       2. Push Stream       +----------+
| Producer | --------------------------------------------> | Message Broker | -------------------------> | Consumer |
+----------+                                               +----------------+                            +----------+
     |                                                             |                                          |
  (Network partition drops packet)                         (Memory buffer full)                        (Process crashes during processing)
  --> Message Lost                                         --> Message Lost                            --> Message Lost
```

### How It Works & Protocol Mechanics

1. **Fire-and-Forget Pattern**: The sender transmits the payload to the socket buffer and does not block for a network acknowledgment (ACK/NACK).
2. **In-Memory Buffering**: Brokers or message buses buffer messages in ephemeral RAM rings without flushing to disk or WAL (Write-Ahead Logs).
3. **No Retries or Consumer Offsets**: The broker does not track consumer ACK state, read pointers, or unacknowledged message queues. If a consumer crashes mid-execution, the unacknowledged message is lost forever.
4. **Transport Layer Protocols**: Often implemented on top of **UDP**, **RTP (Real-Time Transport Protocol)**, or lightweight pub/sub channels like **Redis Pub/Sub**.

### Delivery Guarantees Comparison Matrix

| Semantic | Data Loss Allowed | Duplicate Risk | Network Overhead | Broker Disk I/O | Common Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **At-Most-Once** | **Yes (0 or 1 delivery)** | **Zero** | Lowest (No ACKs) | None (In-Memory) | Telemetry, Metrics, Video Streaming, Gaming |
| **At-Least-Once** | No (1 or more delivery) | High | Medium (ACKs + Retries) | High (WAL Persisted) | Financial Orders, Payment Processing |
| **Exactly-Once** | No (Exactly 1 delivery) | Zero | Highest (2PC / Idempotency) | Very High (State Store + WAL) | Banking Ledgers, Billing Systems |

### Real-World Engineering Scenarios

- **Metrics & Telemetry Aggregation (StatsD / Prometheus Push)**: When streaming 100,000 metrics/sec per node, losing 1 metric data point does not impact overall trend accuracy, but blocking metric emission could crash main app worker threads.
- **Voice Over IP (VoIP) & Live Video Streaming**: Skipping dropped audio/video frames keeps stream playback synchronized in real time; retransmitting stale frames causes playback jitter and lag.
- **High-Frequency Multiplayer Game State**: Player X-Y-Z position co-ordinates updated 60 times/sec override missed prior packets; stale positional data is useless.

### Trade-offs & System Design Considerations

- ✅ **Ultra-Low Latency**: Eliminates round-trip time (RTT) delays for network acknowledgments and storage sync locks.
- ✅ **High Scalability & Throughput**: Eliminates producer backpressure and storage bottlenecks.
- ✅ **Simplified Consumer Logic**: Consumers do not require deduplication stores, distributed locks, or state tracking.
- ❌ **Unrecoverable Data Loss**: Network partitions, memory buffer exhaustion, or pod restarts result in permanent data loss.
### Concrete Implementation Pattern (Fire-and-Forget UDP Socket)

```go
// Go Fire-and-Forget UDP Telemetry Emitter
package main

import (
    "net"
    "time"
)

func SendMetricsAtMostOnce(addr string, payload []byte) error {
    conn, err := net.DialTimeout("udp", addr, 500*time.Millisecond)
    if err != nil {
        return err // Network dial error, drop metric
    }
    defer conn.Close()
    
    // Non-blocking write to socket buffer. No ACK expected or tracked.
    conn.SetWriteDeadline(time.Now().Add(50 * time.Millisecond))
    _, _ = conn.Write(payload)
    return nil
}
```

### Production Edge Cases & Failure Modes

1. **UDP Packet Truncation**: IP packets larger than the Maximum Transmission Unit (MTU - typically 1500 bytes) trigger IP fragmentation, increasing drop rates. Keep payloads under 1400 bytes.
2. **Kernel Socket Buffer Overflow**: High traffic surges fill the OS socket buffer (`sysctl net.core.wmem_default`). Overflow packets are silently dropped by the Linux kernel.
3. **Consumer Pod Restarts**: Un-acknowledged messages in flight during a consumer Kubernetes pod restart are lost permanently without log traces.

### Key takeaway

At-most-once delivery prioritizes **speed and throughput over reliability**. Use it when latency demands override data completeness and when missing individual records does not compromise business correctness.
