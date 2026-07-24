# Design Nearby Friends
> **Category:** Location Based Systems

---

### Overview
**Nearby Friends** (e.g., Facebook Nearby Friends) tracks real-time location updates from active mobile users, emitting alerts when friends are within a designated geographic radius.

### System Architecture Diagram

```
User Mobile Device                                Location Gateway                     Friend Mobile Device
       |                                                 |                                      |
       | === 1. WebSocket GPS (Lat/Lon) ===============> |                                      |
       |                                                 |                                      |
       |                                                 v 2. Update Location Cache            |
       |                                       +-------------------+                            |
       |                                       | Redis Location    |                            |
       |                                       | Memory Store      |                            |
       |                                       +-------------------+                            |
       |                                                 |                                      |
       |                                                 v 3. Spatial Match                     |
       |                                       +-------------------+                            |
       |                                       | Proximity Matcher |                            |
       |                                       +-------------------+                            |
       |                                                 | 4. Proximity Alert                   |
       | <=== 5. WebSocket Proximity Event ==============+=====================================>|
```

### Proximity Calculation Optimization: Geohash Grids
Instead of calculating pairwise distance between all user pairs ($O(N^2)$), compute distance strictly for friends located in the **same or adjacent Geohash grid cells**:

```
+-----------+-----------+-----------+
| Geohash   | Geohash   | Geohash   |
| Cell 1    | Cell 2    | Cell 3    |
+-----------+-----------+-----------+
| Geohash   | USER A    | Geohash   |
| Cell 4    | (Cell 5)  | Cell 6    |
+-----------+-----------+-----------+
| Geohash   | Geohash   | Geohash   |
| Cell 7    | Cell 8    | Cell 9    |
+-----------+-----------+-----------+
```

### Redis Spatial Data Structures
- `GEOADD user_locations <lon> <lat> <user_id>`
- `GEORADIUSBYMEMBER user_locations <user_id> 5 km`

### Key takeaway
Scale real-time location tracking by holding locations in **Redis Geo / Pub-Sub** and limiting proximity searches strictly to **adjacent Geohash grid cells**.
