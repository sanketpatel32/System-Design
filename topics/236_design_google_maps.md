# Design Google Maps
> **Category:** Location Based Systems

---

### Overview
**Google Maps** is a digital mapping and navigation service providing vector map tile rendering, geocoding, real-time traffic monitoring, and A* / Dijkstra shortest-path route planning.

### Architecture Topology Diagram

```
+--------+     1. GET /v1/tile?x=10&y=20&z=15     +-------------------+
| Client | -------------------------------------> | Map Tile Gateway  |
+--------+                                        +-------------------+
    ^                                                       |
    | 4. Vector Tile Protobuf Payload                       v 2. Fetch Map Tile
    |                                             +-------------------+       Hit       +---------------+
    | <------------------------------------------ | Redis / S3 Tile   | --------------> | CDN Delivery  |
    |                                             | Cache             |                 +---------------+
    |                                             +-------------------+
    | 5. GET /v1/route?origin=A&dest=B                      | Miss
    v                                                       v 3. Render Vector Tile
+-------------------+                             +-------------------+
| Routing Service   |                             | Tile Renderer     |
| (Graph Engine)    |                             +-------------------+
+-------------------+
```

### System Subsystems & Algorithms

| Subsystem | Responsibilities & Algorithms |
|---|---|
| **Map Tile Engine** | Renders static/vector map tiles at zoom levels $Z_0$ to $Z_{22}$ cached in CDN. |
| **Geocoding Service**| Translates street address strings into (`lat, lon`) pairs via inverted index. |
| **Routing Engine** | Shortest path routing over road network graphs using **Contraction Hierarchies / A* Search**. |
| **Traffic Engine** | Aggregates real-time GPS telemetry from active driver devices to compute edge weights on road graphs. |

### Road Network Graph Model
Roads are modeled as a directed weighted graph:
- **Vertices (Nodes)**: Intersections (`lat, lon`).
- **Edges**: Road segments with dynamic weights ($W = \frac{\text{Distance}}{\text{Real-time Speed}}$).

### Key takeaway
Google Maps splits operations into **cached vector map tiles (S3/CDN)** for rendering and **Contraction Hierarchies (A* graph search)** on dynamic road network graphs for route planning.
