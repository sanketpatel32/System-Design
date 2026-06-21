# Design Real-Time Dashboard

> **Category:** Data Intensive Systems

---

Design a real-time dashboard (live metrics, sub-second updates).

### Requirements
- **Functional**: live updates; multiple charts; filtering.
- **Non-functional**: <1s latency from event to dashboard.

### Architecture
```
[Events] -> [Stream processor (Flink)] -> [Materialized views] -> [WebSocket]
```

### Stream processing
- Flink / Spark Streaming / Kafka Streams.
- Compute aggregates in real time.

### Materialized views
- Pre-computed aggregations.
- Updated on each event.
- Fast dashboard reads.

### WebSocket push
- Server pushes updates to browser.
- No polling.

### Sampling
- For high-volume events: sample.
- Real-time doesn't need exact counts.

### Time windows
- Last 1 min, 5 min, 1 hour, 24 hours.
- Sliding window aggregations.

### Key takeaway
Real-time dashboard = stream processor (Flink) → materialized views → WebSocket push.
Pre-compute aggregations to keep dashboard reads fast. Sample for very high event volumes.
