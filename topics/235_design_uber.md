# Design Uber / Ola
> **Category:** Location Based Systems

---

### Overview
**Uber / Ola** is a global ride-hailing platform connecting millions of riders with nearby drivers in real time. The system handles continuous driver GPS location tracking (every 4 seconds), spatial indexing for nearby driver discovery, real-time dispatch matching, and dynamic surge pricing.

Core engineering demands sub-second geospatial query latency, reliable WebSocket connection gateways, and scalable spatial indexing using **Uber H3 (Hexagonal Hierarchical Spatial Index)** or **Geohash**.

### System Architecture & Location Tracking Topology

```
+--------------------------------------------------------------------------+
| DRIVER MOBILE APP (Sends GPS location update every 4 seconds)            |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. WS Location Update (Lat, Long, Driver_ID)
+--------------------------------------------------------------------------+
| WEBSOCKET LOCATION GATEWAY                                               |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Update Hexagon Cell Location
+--------------------------------------------------------------------------+
| GEOSPATIAL INDEX SERVICE (Uber H3 Spatial Index in Redis Memory)         |
+--------------------------------------------------------------------------+
                                     ^
                                     | 3. Request Nearby Drivers (H3 Cell k-ring)
+--------------------------------------------------------------------------+
| RIDE MATCHING & DISPATCH ENGINE                                          |
| (Evaluates ETA, Driver Rating, Bipartite Matching via Hungarian Algo)   |
+--------------------------------------------------------------------------+
                                     ^
                                     | 4. POST /api/v1/rides/request
+--------------------------------------------------------------------------+
| RIDER MOBILE APP                                                         |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics & Geospatial Indexing
1. **Uber H3 Hexagonal Spatial Index:** Partitions the Earth's surface into hexagonal grid cells across 16 resolution levels. Unlike square grids, all neighboring hexagon cell centroids are equidistant, simplifying spatial search algorithms ($k$-ring searches).
2. **Real-Time Driver Location Storage:** Active driver locations are updated in Redis memory (`H3 Cell ID -> Set of Driver IDs`) every 4 seconds. Locations are expired after 30 seconds to automatically prune offline drivers.
3. **Trip State Machine:** Manages ride lifecycle states (`REQUESTED` $\rightarrow$ `MATCHING` $\rightarrow$ `ACCEPTED` $\rightarrow$ `ARRIVED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `COMPLETED`).

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/location/driver`| WS / POST | `{"driver_id": "d_881", "lat": 37.7749, "lng": -122.4194, "bearing": 180}` | `{"status": "ACK"}` |
| `/api/v1/rides/request` | POST | `{"rider_id": "r_99", "pickup": {"lat": 37.7, "lng": -122.4}, "dropoff": {"lat": 37.8, "lng": -122.5}}`| `{"trip_id": "trip_992", "status": "SEARCHING", "estimated_fare": 24.50}` |
| `/api/v1/rides/{id}/cancel`| POST | `{"reason": "CHANGED_MIND"}` | `{"status": "CANCELLED", "cancellation_fee": 0.00}` |

### Geospatial Storage Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `driver_id` | String | Redis / Memory | Unique driver identifier. |
| `h3_index` | String (Resolution 8)| Redis Memory | H3 Hexagon cell index (e.g., `8828308281fffff`). |
| `lat` / `lng` | Double | Redis GEO / Memory | Exact GPS coordinate representation. |
| `trip_id` | UUID | CockroachDB / Cassandra| Primary Key for trip transaction record. |
| `trip_status` | Enum | Relational DB | Current lifecycle state of ride transaction. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Uber H3 Hexagonal Index vs Geohash**| Equal centroid distances to all 6 adjacent neighbors; eliminates Geohash edge distortion. | Slightly higher CPU computation to convert GPS (Lat/Long) to H3 index. | Global ride-hailing and location dispatch engines. |
| **In-Memory Redis Location Storage** | Sub-millisecond $O(1)$ geospatial update and read performance. | High memory footprint; requires Redis Cluster replication for fault tolerance. | High-frequency live GPS tracking systems. |
| **WebSocket Connection Gateways** | Low network header overhead for continuous 4-second location ping updates. | Requires maintaining millions of open persistent socket connections. | Mobile driver and rider apps. |

### Key takeaway
**Uber** scales real-time ride matching by indexing driver locations in **Uber H3 Hexagonal Grid Cells** stored in **Redis in-memory caches**, updating GPS coordinates every 4 seconds over persistent **WebSocket gateways**.
