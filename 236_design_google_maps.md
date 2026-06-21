# Design Google Maps

> **Category:** Location Based Systems

---

Design Google Maps: routing, search, traffic, POI.

### Requirements
- **Functional**: search places; route between points; ETA with traffic; turn-by-turn nav.
- **Non-functional**: low-latency routing; global scale.

### Components
- **Maps tiles**: rendered map images (CDN).
- **Places DB**: POI, addresses (Postgres / ES).
- **Routing engine**: Dijkstra / A* on road graph.
- **Traffic**: real-time + historical.

### Routing
- Road network as graph (nodes = intersections, edges = roads).
- A* with heuristic (geographic distance).
- Traffic weights edges (real-time).

### ETA
- Sum of edge traversal times (factoring traffic).
- ML for prediction accuracy.

### Tiles
- Pre-rendered at multiple zoom levels.
- CDN caches per region.

### Key takeaway
Google Maps = road graph + A* routing + traffic weighting + map tiles (CDN) + places DB.
Routing is graph traversal; traffic makes edges dynamic. Tiles pre-rendered for fast pan/zoom.
