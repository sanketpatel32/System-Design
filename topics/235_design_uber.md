# Design Uber / Ola
> **Category:** Location Based Systems

---

### Overview
**Uber / Ola** is a location-based ride-hailing system facilitating real-time driver tracking, spatial geo-query matching, dynamic surge pricing, and trip routing between riders and drivers.

### Architecture Topology Diagram

```
Driver App (Location Updates)                    Rider App (Request Ride)
     |                                                 |
     v 1. WebSockets (GPS Lat/Lon)                     v 2. POST /v1/rides
+-------------------+                             +-------------------+
| Location Gateway  |                             | Ride Service      |
+-------------------+                             +-------------------+
          |                                                 |
          v 3. Update Geo Index                             v 4. Spatial Matching
+-------------------+                             +-------------------+
| Redis Geohash /   | <-------------------------- | Match Engine      |
| Spatial Index     |                             | (QuadTree / H3)   |
+-------------------+                             +-------------------+
```

### Geospatial Indexing Strategies

| Indexing Scheme | Representation | Precision Control | Use Case |
|---|---|---|---|
| **Geohash** | Base32 string (e.g., `9q9hv`) | String prefix length (5 chars = 4.9km, 7 chars = 150m) | Fast Redis proximity lookups |
| **Uber H3** | Hexagonal spatial index | 16 resolution levels | Ideal for area aggregation & surge pricing |
| **QuadTree** | 2D spatial tree split into 4 quadrants | Tree depth based on point density | Balanced spatial partitioning |

### Trip Match Workflow
1. Rider sends pickup location (`lat, lon`).
2. Match Engine converts coordinates to **H3 Index / Geohash**.
3. Query **Redis Geohash Index** for available drivers within radius $R$ (e.g., 2 km).
4. Rank drivers by distance, ETA, and acceptance rate; send WebSocket ride offer to top driver.

### Key takeaway
Uber relies on **geospatial indexing (Geohash / Uber H3)** cached in **Redis** to execute low-latency driver proximity queries and dynamic surge pricing calculations.
