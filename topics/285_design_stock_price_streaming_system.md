# Design Stock Price Streaming System

> **Category:** Real-Time Systems

---

A Stock Price Streaming System ingests high-frequency market tick data from financial exchanges and broadcasts live price updates, order books, and ticker charts to millions of financial terminal clients.

### System Requirements
- **Functional Requirements**:
  - Real-time ingestion of stock trade ticks and bid/ask quote updates.
  - Low-latency fan-out to connected web and mobile trading applications.
  - Historical ticker query support for chart generation.
- **Non-Functional Requirements**:
  - Ultra-Low Latency: Sub-10ms distribution from exchange ingest to client render.
  - High Throughput: Process hundreds of thousands of price ticks per second during market open/close.
  - Zero Data Corruption: Strict ordering guarantees for tick updates.

### System Architecture
```
[ Financial Exchange Feed ] ---> [ FIX Protocol Ingest ] ---> [ Ring Buffer (Disruptor) ]
                                                                      |
                                                                      v
                                                          [ Streaming Engine (Kafka) ]
                                                                      |
        +-------------------------------------------------------------+-------------------------------------------------------------+
        |                                                                                                                           |
        v                                                                                                                           v
[ High-Fanout Gateway Cluster ]                                                                             [ Time-Series DB (ClickHouse) ]
(WebSockets / SSE Push Nodes)                                                                              (Historical Ticker Candles)
        |                                                                                                                           |
        v                                                                                                                           v
[ Client Trading Terminals ]                                                                                [ Analytics API ]
```

### Optimization Techniques
| Technique | Implementation | Impact |
|---|---|---|
| **LMAX Disruptor Ring Buffer** | Lock-free in-memory ring buffer | Millions of events/sec per thread with sub-microsecond latency. |
| **Delta Encoding** | Transmits price deltas (`+0.05`) instead of full price payloads | Reduces network payload size by > 70%. |
| **Binary Protocols** | Protocol Buffers / FlatBuffers instead of JSON | Eliminates JSON serialization overhead. |

### Key takeaway
Stock price streaming systems achieve sub-10ms fan-out using lock-free ring buffers (LMAX Disruptor), binary delta encoding (Protobuf), and WebSocket push gateways backed by time-series databases.
