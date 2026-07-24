# Design Nearby Friends
> **Category:** Location Based Systems

---

### Overview
**Nearby Friends** (e.g., Snapchat Snap Map, Facebook Nearby Friends) tracks real-time location updates of opted-in users and alerts them when friends are geographically close (e.g., within a 5 km radius).

Core design constraints mandate **battery-conscious mobile location reporting**, sub-second location fanout to online friends, Geohash spatial indexing, and strict location privacy boundaries.

### System Architecture & Nearby Friends Topology

```
+--------------------------------------------------------------------------+
| MOBILE CLIENT (Sends Location Ping: Lat, Long, User_ID every 30s)        |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Location Ping over WebSocket
+--------------------------------------------------------------------------+
| WEBSOCKET LOCATION GATEWAY                                               |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Update Location & Check Geohash
+--------------------------------------------------------------------------+
| REDIS GEOSPATIAL CLUSTER (Stores Geohash & Active User Coordinates)       |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Query Friend Graph & Nearby Geohash
+--------------------------------------------------------------------------+
| NEARBY FRIENDS SERVICE                                                   |
| Evaluates Euclidean Distance: Distance(User, Friend) <= 5 km             |
+--------------------------------------------------------------------------+
                                     |
                                     v 4. Push Proximity Alert Frame
+--------------------------------------------------------------------------+
| WEBSOCKET PUSH GATEWAY -> FRIENDS' MOBILE CLIENTS                        |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Geohash Spatial Indexing:** Converts 2D latitude/longitude coordinates into a 1D alphanumeric string (e.g., `9q9hv`). Nearby geographical points share long matching Geohash prefixes. A 5-character Geohash represents a bounding box of roughly $\approx 4.9 \text{ km} \times 4.9 \text{ km}$.
2. **Redis Geo Data Structures:** Stores user locations using `GEOADD` and executes spatial radius lookups (`GEORADIUSBYMEMBER user_id 5 km`) in $O(N + \log M)$ time.
3. **Adaptive Battery-Conscious Mobile Location Reporting:** Mobile SDK adjusts GPS reporting interval based on user state:
   - **Stationary (Device charging/idle):** Ping every 5 to 10 minutes.
   - **Moving (Walking/Driving):** Ping every 30 seconds.

### API Interface Specifications

| Endpoint / Protocol | Type | Request Payload | Response Payload |
|---|---|---|---|
| `WS /v1/location` | WebSocket | `{"user_id": "u_99", "lat": 37.7749, "lng": -122.4194, "timestamp": 1700000000}` | `{"status": "ACK"}` |
| `/api/v1/friends/nearby`| HTTPS GET | `{"radius_km": 5}` | `{"nearby_friends": [{"friend_id": "u_42", "distance_km": 1.2, "last_seen_sec": 14}]}` |

### Location & Friend Cache Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `user_id` | String | Redis Cache | Unique user identifier. |
| `geohash` | String (5 Chars) | Redis Sorted Set | Geohash string bucket for spatial filtering. |
| `lat` / `lng` | Double | Redis GEO | Exact GPS coordinates. |
| `friends_list:{user_id}`| Redis Set | Redis Cache | Cached array of user's active friend IDs. |
| `ttl_expiration` | Integer | Redis Key | Expiration timestamp (e.g., 10 minutes) purging inactive users. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Redis GEO / Geohash Spatial Search** | Sub-millisecond radius search queries; native Redis command support (`GEORADIUS`). | High RAM consumption in Redis for millions of active user location keys. | Real-time nearby user discovery systems. |
| **Adaptive Mobile GPS Ping Intervals**| Preserves mobile device battery life; reduces unnecessary server ingestion traffic. | Location indicators for stationary users may lag behind real-time movement by a few minutes. | Consumer mobile location sharing applications. |
| **WebSocket Pub/Sub Fanout** | Pushes nearby proximity alerts to friends in real time without client polling. | High server socket connection overhead during large event gatherings. | Live location sharing platforms. |

### Key takeaway
**Nearby Friends** discovers nearby connections under 100ms by storing coordinates in **Redis GEO / Geohash spatial indices**, evaluating friend proximity via adaptive battery-conscious GPS reporting, and fanning out alerts over **WebSocket Gateways**.
