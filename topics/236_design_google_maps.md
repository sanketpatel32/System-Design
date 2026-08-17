# Design Google Maps
> **Category:** Location Based Systems

---

### Overview
**Google Maps** provides mapping, turn-by-turn navigation, geocoding, and real-time traffic conditions for over 1 billion monthly active users.

The system requires two major architectures: **Vector Tile Rendering Engine** (serving pre-rendered map graphics via edge CDNs) and **Routing Graph Engine** (calculating shortest/fastest paths over millions of road segments using Contraction Hierarchies and A* algorithms).

### System Architecture & Routing Topology

```
+--------------------------------------------------------------------------+
| GOOGLE MAPS CLIENT (Mobile / Web Vector Renderer)                        |
+--------------------------------------------------------------------------+
          |                                                   |
          | 1. Fetch Map Tiles (Zoom Level 14, Tile X/Y)      | 2. Route Request (Origin -> Dest)
          v                                                   v
+------------------------------------+             +------------------------------------+
| MAP TILE CDN NETWORK               |             | ROUTING ENGINE GATEWAY             |
| (Edge Cached Protocol Buffer Tiles)|             +------------------------------------+
+------------------------------------+                                |
                                                                      | 3. Query Graph & Live Traffic
                                                                      v
                                                   +------------------------------------+
                                                   | ROAD GRAPH & TRAFFIC ENGINE        |
                                                   | (Contraction Hierarchies / A*)     |
                                                   +------------------------------------+
                                                                      |
                                                                      v 4. Aggregate Segment Speeds
                                                   +------------------------------------+
                                                   | REAL-TIME TRAFFIC AGGREGATOR       |
                                                   | (Location Ping Velocity Pipeline)  |
                                                   +------------------------------------+
```

### Key Technical Mechanics
1. **Vector Map Tiles (Sippy / Protobuf):** Map data is divided into square grid tiles at multiple zoom levels (0 to 22). Instead of heavy image PNGs, client devices receive lightweight **Vector Protocol Buffer Tiles** containing raw geometric lines and polygons, rendered client-side on GPU.
2. **Road Network Graph & Contraction Hierarchies (CH):** Models road networks as a directed weighted graph (V: Intersections, E: Road segments, Weights: Travel time). Contraction Hierarchies pre-computes shortcut edges between major highway nodes, speeding up route calculation by 1,000x compared to standard Dijkstra.
3. **Real-Time Segment Traffic Speed Ingestion:** Aggregates anonymous GPS location updates from active mobile devices to compute real-time average vehicle speeds per road segment, dynamically updating graph edge weights.

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/tile/{z}/{x}/{y}` | GET | `z=14`, `x=2841`, `y=6412` | Binary Protocol Buffer vector tile file payload. |
| `/api/v1/directions` | GET | `origin=37.77,-122.41`, `destination=37.33,-121.88`, `mode=driving` | `{"routes": [{"distance_meters": 78200, "duration_sec": 2840, "steps": [...]}]}` |
| `/api/v1/geocode/json` | GET | `address="1600 Amphitheatre Pkwy, Mountain View, CA"` | `{"lat": 37.422, "lng": -122.084}` |

### Map Tile & Routing Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `tile_key` | String (`z_x_y`) | CDN Edge / S3 | Vector tile lookup key (`14_2841_6412`). |
| `segment_id` | Int64 | Graph Database / Memory | Unique road segment edge ID in routing graph. |
| `start_node` / `end_node`| Int64 | In-Memory Graph | Intersection vertex IDs defining road segment. |
| `base_travel_time_sec` | Float | In-Memory Graph | Baseline travel duration based on speed limit. |
| `current_speed_kph` | Float | Redis Cache | Real-time traffic speed aggregated from device pings. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Vector Tiles over Raster Image Tiles**| 90% bandwidth savings; sharp rendering at all zoom levels; client-side styling. | Requires GPU rendering engine capability on client device. | Modern web and mobile interactive mapping applications. |
| **Contraction Hierarchies Routing Algorithm**| Calculates optimal cross-country routes in < 10ms over millions of graph nodes. | Pre-computation cost; inserting new dynamic road closures requires graph shortcut recalculation. | Production turn-by-turn navigation systems. |
| **Anonymous GPS Speed Aggregation** | Provides real-time traffic congestion visibility without manual incident reports. | High telemetry ingestion pipeline volume (Kafka + Flink). | Live traffic estimation engines. |

### Key takeaway
**Google Maps** delivers sub-10ms routing over millions of road segments using **Contraction Hierarchies on directed road graphs**, serving lightweight **Vector Protocol Buffer Map Tiles** via edge CDNs.
