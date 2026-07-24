# At-Most-Once Delivery

> **Category:** Message Queues and Event Streaming

---

At-most-once delivery is a messaging guarantee where a message is delivered **at most one time** (0 or 1 times). Under this model, message loss is acceptable, but duplicate delivery is strictly prevented.

### How It Works

The producer transmits the message over the network and immediately considers the operation complete without waiting for an acknowledgment (ACK) from the message broker or consumer. If a network partition, process crash, or buffer overflow occurs, the message is lost permanently.

```
+----------+      1. Send Message (No ACK)      +----------------+      2. Push      +----------+
| Producer | ---------------------------------> | Message Broker | ----------------> | Consumer |
+----------+                                    +----------------+                   +----------+
     |                                                  |                                 |
  (Fails?)                                         (Buffer Full?)                     (Crashes?)
  Dropped!                                           Dropped!                          Dropped!
```

### Protocol & Mechanism Details

1. **Fire-and-Forget Pattern**: The sender pushes payload to the socket buffer and returns control immediately to the application loop.
2. **No Persisted State**: The broker does not log the message to disk or track consumer offsets for retransmission.
3. **Consumer Processing**: The consumer reads messages directly from memory or UDP streams. No acknowledgment signal is sent back upstream.

### Delivery Guarantee Comparison

| Semantic | Message Loss | Duplicate Risk | Latency | Overhead | Common Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **At-Most-Once** | Allowed | Zero | Lowest | Minimal | Metrics, IoT Telemetry, Voice/Video |
| **At-Least-Once** | Zero | High | Medium | ACKs + Retries | Order Processing, Email Alerts |
| **Exactly-Once** | Zero | Zero | Highest | Heavy (2PC / Dedupe) | Financial Ledger, Billing Systems |

### Trade-offs & Engineering Considerations

- ✅ **Ultra-Low Latency**: No waiting for disk sync, leader replication, or consumer ACKs.
- ✅ **Maximum Throughput**: Sender and broker operate at raw network throughput without backpressure blocking.
- ✅ **Simplified Consumer Logic**: Consumers never need deduplication tables, idempotency keys, or state tracking.
- ❌ **Data Loss**: Any network disruption or pod restart causes unrecoverable data loss.

### Real-World Use Cases

- **Metrics Collection (StatsD / Prometheus push)**: Dropping 1 sample out of 10,000 metric data points does not distort general trend lines.
- **Real-Time Video / Voice Streaming (RTP / UDP)**: Stale audio packets are useless; skipping dropped frames maintains live sync.
- **Location Tracking (GPS Telemetry)**: Subsequent location updates override missed prior updates.

### Key takeaway

At-most-once delivery prioritizes **speed and throughput over reliability**. Use it exclusively when system throughput demands outweigh the cost of occasional data loss and when idempotency management adds unnecessary overhead.
