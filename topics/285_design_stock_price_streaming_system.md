# Design Stock Price Streaming System

> **Category:** Real-Time Systems

---

Design a system to stream real-time stock prices.

### Requirements
- **Functional**: subscribe to symbols; receive live prices; historical.
- **Non-functional**: low-latency (<100ms); high throughput.

### Architecture
```
[Exchange feeds] -> [Ingestor] -> [Kafka] -> [Stream processor]
                                              |
                                              v
                                         [Time-series DB]
                                         [WebSocket gateway]
                                              |
[Client] <-WebSocket-------+
```

### Ingestion
- Connect to exchange APIs (FIX, websocket).
- Normalize formats.
- Publish to Kafka.

### Stream processing
- Filter per user's subscriptions.
- Compute rolling stats.
- Push to subscribers.

### WebSocket
- Client subscribes to symbols.
- Server pushes updates.

### Storage
- **Time-series DB** (InfluxDB, kdb+) for history.
- Real-time cache in Redis.

### Backpressure
- High-volume bursts (market open).
- Sample / drop oldest for clients that can't keep up.

### Key takeaway
Stock streaming = exchange feed → Kafka → stream processor → WebSocket push to subscribers.
Time-series DB for history. Handle backpressure during market-open bursts.
