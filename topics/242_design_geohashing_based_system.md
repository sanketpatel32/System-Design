# Design Geohashing Based System

> **Category:** Location Based Systems

---

Design spatial queries using geohashing.

### What is geohashing
- Encode (lat, long) into a string.
- Nearby points share prefix.
- Hierarchical: longer prefix = smaller area.

```
lat 40.7128, long -74.0060 -> "dr5regw"
"dr5" covers NYC area.
"dr5regw" covers ~38m × 19m.
```

### Use cases
- "Find users within 1km" → query same + neighbor cells.
- "All drivers in this area" → cell lookup.
- Spatial sharding (shard by geohash).

### Neighbor computation
- For each geohash, compute 8 neighbors.
- Used for "nearby" queries that span cell boundaries.

### Precision vs cell size
| Geohash length | Cell size |
|----------------|-----------|
| 1 | 5000 km |
| 4 | 39 km |
| 6 | 1.2 km × 0.6 km |
| 8 | 38m × 19m |

### Storage
- Index geohash in DB.
- Prefix query for nearby.

### Trade-offs
- ✅ Simple spatial index.
- ✅ Works with standard DB indexes.
- ❌ Edge of cell (points close but in different cells).
- ❌ Some cells near poles have weird shapes.

### Alternatives
- **Quadtree**: hierarchical, better near equator.
- **R-tree**: specialized spatial index (PostGIS).
- **S2 / H3**: Google / Uber cell systems.

### Key takeaway
Geohashing encodes lat/long into prefix-shareable strings for fast "nearby" queries. Pick
precision for the radius you need. Edge effects (close points in different cells) → query
neighbors too.
