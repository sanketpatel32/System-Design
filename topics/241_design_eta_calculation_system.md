# Design ETA Calculation System

> **Category:** Location Based Systems

---

An Estimated Time of Arrival (ETA) calculation system computes travel duration and optimal routing between origin and destination points in real time, accounting for current road network conditions, live traffic speed, and historical patterns.

### System Requirements
- **Functional Requirements**:
  - Calculate accurate route distance and ETA for origin/destination coordinate pairs.
  - Dynamically recalculate routes and ETA when live traffic conditions change or drivers deviate.
  - Support multi-segment navigation (pickups, drop-offs, multi-stop delivery).
- **Non-Functional Requirements**:
  - Low Latency: Sub-50ms query latency for ETA lookup during dispatch and ride matching.
  - High Scalability: Handle 100,000+ location updates/sec and tens of thousands of ETA queries/sec.
  - High Availability: 99.99% uptime with regional fault tolerance.

### System Architecture
```
[ Mobile Apps / Drivers ] ---> [ Location Telemetry Ingest (Kafka) ]
                                            |
                                            v
[ API Gateway ] --------> [ Routing & ETA Engine ] <---> [ Speed Aggregator (Flink/Redis) ]
                               |               |
                               v               v
                [ Contraction Hierarchies ]  [ ML Travel-Time Model ]
```

### Graph Partitioning & Routing Algorithms
| Algorithm / Technique | Primary Use Case | Time Complexity | Trade-offs |
|---|---|---|---|
| **Dijkstra's Algorithm** | Baseline shortest path | $O(E + V \log V)$ | Slow for continental road networks; unviable for real-time APIs. |
| **A* Search** | Heuristic-guided routing | $O(E)$ worst case | Depends on Euclidean heuristic quality; slower with live traffic weight changes. |
| **Contraction Hierarchies (CH)** | Preprocessed fast routing | Sub-millisecond queries | Expensive graph rebuilds when live traffic changes edge weights. |
| **ML Travel-Time Refinement** | Final ETA adjustments | $O(1)$ inference | Requires continuous retraining on historical trip execution logs. |

### API Design
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/eta/calculate` | POST | Compute route & ETA between coordinates | `origin: {lat, lon}`, `destination: {lat, lon}`, `departure_time` |
| `/v1/eta/matrix` | POST | Many-to-many distance/ETA matrix for dispatch | `origins: [...]`, `destinations: [...]`, `mode: "driving|biking"` |
| `/v1/telemetry/speed` | POST | Real-time driver GPS speed stream | `driver_id`, `segment_id`, `speed_kmh`, `timestamp` |

### Key Challenges & Mitigations
- **Live Traffic Weight Updates**: Updating Contraction Hierarchy shortcuts dynamically when traffic changes is computationally expensive. *Mitigation*: Use Customizable Contraction Hierarchies (CCH) or overlay real-time speed metrics on partitioned grid tiles (e.g., H3 / Geohash level 6).
- **Urban Congestion & Signal Delays**: Graph edge weights based purely on physical distance fail to account for traffic lights and intersection delays. *Mitigation*: Incorporate turn-penalty costs and historical intersection dwell time matrices into edge weights.

### Key takeaway
Real-time ETA systems combine graph algorithms (Contraction Hierarchies / CCH) for fast routing with real-time speed streams (Kafka/Flink) and ML models (gradient boosted trees/deep learning) to refine predictions based on historical patterns and live road friction.
