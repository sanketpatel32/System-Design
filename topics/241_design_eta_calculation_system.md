# Design ETA Calculation System

> **Category:** Location Based Systems

---

Design ETA: predict arrival time for trips.

### Requirements
- **Functional**: ETA for routes; account for traffic; accurate.
- **Non-functional**: low-latency.

### Approach
- **Road graph**: nodes = intersections, edges = road segments.
- **Edge weights**: traversal time (current + historical traffic).
- **Dijkstra / A*** for shortest path.
- Sum of edge times = ETA.

### Traffic
- Real-time: from drivers' GPS speeds.
- Historical: by time of day, day of week.

### ML layer
- Train model on actual trip times.
- Predict ETA more accurately than graph sum.

### Architecture
```
[Origin/destination] -> [Routing engine (graph + traffic)]
                         |
                         v
                       [ETA predictor (ML)]
```

### Key takeaway
ETA = road graph + Dijkstra/A* + traffic-weighted edges + ML refinement. Real-time traffic from
driver GPS. ML trained on actual trip times for accuracy.
