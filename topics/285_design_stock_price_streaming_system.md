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

### Ordering & Conflation Model
- **Per-symbol ordering**: ticks for one symbol must arrive in sequence-number order; partition the streaming engine by symbol/ticker so parallelism never reorders one instrument.
- **Conflation under pressure**: when a client (or downstream) can't keep up, replace stale ticks for the same symbol with the newest — a live ticker cares about the *latest* price, not every intermediate tick. Conflation policies differ per surface: charts conflate to time bars, order books conflate to snapshots.
- **Sequence gaps**: each tick carries the exchange sequence number; a detected gap (feed handler restart) triggers a snapshot recovery from the exchange's recovery service rather than interpolating.
- **Backpressure boundary**: the ingest ring buffer either overwrites oldest (market data is more valuable fresh) or applies side-channel spill — never blocks the feed handler.

### Consistency & Client Semantics
| Concern | Design |
|---|---|
| **Ticker vs trade vs quote** | Separate streams/channels per data type — a chart subscriber shouldn't pay the order-book bandwidth. |
| **Stale price detection** | Clients mark a quote stale if the last update exceeds N× typical interval; server heartbeats carry sequence + timestamp. |
| **Snapshot + delta join** | New subscribers receive a snapshot first, then deltas applied by sequence — deltas before the snapshot are dropped. |
| **Market hours behavior** | Pre/post-market and halted symbols flow with explicit condition flags; clients must not render halted ticks as live trades. |

### Regulatory & Precision Notes
- **Timestamps**: exchange-origin timestamps (not gateway receive time) define event time; clocks via PTP, not NTP, at the ingest tier.
- **Audit trail**: raw un-conflated ticks persist to the time-series store before fan-out — the live path may conflate, the record must not.
- **Precision**: prices as scaled integers (never floats) — IEEE-754 rounding has no place in money.

### Key takeaway
Stock price streaming systems achieve sub-10ms fan-out using lock-free ring buffers (LMAX Disruptor), binary delta encoding (Protobuf), and WebSocket push gateways backed by time-series databases.
