# Design Geohashing Based System

> **Category:** Location Based Systems

---

A Geohashing-based system converts two-dimensional latitude and longitude coordinates into short alphanumeric string keys using Z-order space-filling curves. Geohashes enable fast spatial indexing, range queries, and proximity searches in traditional key-value and relational databases.

### Key Concepts & Precision Levels
Geohash encodes geographic coordinates by interleaving binary bits of latitude and longitude. Longer string prefixes represent smaller, more precise geographical bounding boxes.

| Geohash Length | Grid Cell Dimensions | Typical Application |
|---|---|---|
| **3** | ~ 156 km × 156 km | State / Region level indexing |
| **5** | ~ 4.9 km × 4.9 km | City district / Neighborhood search |
| **6** | ~ 1.2 km × 0.6 km | Nearby ride-hailing driver matching |
| **7** | ~ 152 m × 152 m | Hyper-local venue search & POI matching |

### System Architecture
```
[ Mobile Client ] ---> [ API Gateway ] ---> [ Location Search Service ]
                                                   |
                                   +---------------+---------------+
                                   |                               |
                                   v                               v
                        [ Redis Geohash Index ]        [ Geospatial DB (PostGIS) ]
                        (ZSET / In-Memory)              (Persistence / Complex Polygons)
```

### Spatial Indexing Comparison
| Spatial Index | Indexing Structure | Search Mechanism | Pros & Cons |
|---|---|---|---|
| **Geohash** | Base32 String (Z-Curve) | Prefix string match / B-Tree | Simple DB indexing; edge boundary issues require searching 8 neighbor cells. |
| **Google S2** | 64-bit Integer (Hilbert Curve) | Hierarchy of cell IDs | Superior uniform coverage across poles; highly optimized for 64-bit integer ops. |
| **Uber H3** | Hexagonal Grid System | Hexagon neighbor traversal | Constant distance to all 6 adjacent neighbors; optimal for ride-sharing & supply-demand aggregation. |
| **QuadTree** | 4-way Tree Decomposition | In-memory spatial tree search | Dynamic node splitting based on density; memory intensive to scale horizontally. |

### API Design & Operations
| Endpoint | Method | Description | Request Payload / Params |
|---|---|---|---|
| `/v1/location/update` | POST | Ingest entity location | `entity_id`, `lat`, `lon`, `timestamp` |
| `/v1/location/nearby` | GET | Query entities within radius | `lat`, `lon`, `radius_meters`, `limit` |

### Boundary Challenge & Resolution
Because adjacent points across grid cell lines can have completely different Geohash prefixes, querying only a target entity's Geohash cell misses close entities in adjacent cells.
*Resolution*: Always calculate and query the target cell **plus all 8 surrounding neighbor cells** (9 cells total), then apply Euclidean/Haversine filtering on the returned subset.

### Key takeaway
Geohashing translates 2D spatial coordinates into 1D strings using Z-order space-filling curves, enabling efficient index lookups. To prevent edge-boundary data loss, spatial queries must query the target cell along with its 8 adjacent neighbor cells.
