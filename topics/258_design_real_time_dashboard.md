# Design Real Time Dashboard

> **Category:** Analytics and Data Pipelines

---

A Real-Time Dashboard platform aggregates live stream data and renders continuously updating charts, counters, and metrics to end-user clients with sub-second latency.

### System Requirements
- **Functional Requirements**:
  - Continuously push updated metrics and analytics charts to active web/mobile clients.
  - Perform sliding-window data aggregations (e.g., last 1 min, 5 mins, 1 hour).
  - Support multi-tenant customization and dynamic metric queries.
- **Non-Functional Requirements**:
  - Sub-Second End-to-End Latency: From event occurrence to client dashboard render.
  - High Concurrent Client Connections: Support 100,000+ simultaneous WebSocket subscriptions.
  - Efficient Bandwidth Utilization: Push delta updates rather than full dashboard state.

### System Architecture
```
[ Event Producers ] ---> [ Ingestion Queue (Kafka) ] ---> [ Stream Aggregator (Flink / Storm) ]
                                                                    |
                          +-----------------------------------------+-----------------------------------------+
                          |                                                                                   |
                          v                                                                                   v
              [ In-Memory Cache (Redis) ]                                                         [ WebSocket Gateway Layer ]
              (Latest Window State)                                                            (Push Updates to Clients)
                                                                                                              |
                                                                                                              v
                                                                                                    [ Dashboard Client UI ]
```

### Real-Time Push Technologies & Aggregation Windows
| Technology / Pattern | Protocol / Mechanism | Latency | Bandwidth Overhead |
|---|---|---|---|
| **WebSockets** | Full-duplex TCP connection | < 10 ms | Low (header overhead paid once on handshake). |
| **Server-Sent Events (SSE)** | Single-direction HTTP streaming | < 50 ms | Very low; native browser auto-reconnect. |
| **Tumbling Window Aggregator** | Fixed non-overlapping time windows | Batch bounded | Ideal for predictable periodic dashboard counters. |
| **Sliding Window Aggregator** | Overlapping moving time windows | Continuous stream | Superior real-time trend visualization. |

### Key takeaway
Real-time dashboards connect stream aggregators (Flink) directly to WebSocket/SSE gateway layers, pushing incremental metric deltas to connected clients while maintaining rolling window aggregates in Redis.
