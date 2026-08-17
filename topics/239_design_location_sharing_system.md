# Design Location Sharing System
> **Category:** Location Based Systems

---

### Overview
A **Location Sharing System** (e.g., Apple Find My, Google Location Sharing, Glympse) allows users to continuously share their live physical location with designated contacts temporarily or indefinitely.

The system requires **time-series location storage**, real-time WebSocket location streaming, historical trajectory playback, and strict privacy control boundaries.

### System Architecture & Location Streaming Topology

```
+--------------------+     1. Live GPS Stream (Lat, Long, Battery) +--------------------+
| Sharing Device     | -----------------------------------------> | WebSocket Gateway  |
+--------------------+                                            +--------------------+
                                                                            |
                                                                            | 2. Persist Time-Series
                                                                            v
                                                                  +--------------------+
                                                                  | Location Stream    |
                                                                  | Ingestion Engine   |
                                                                  +--------------------+
                                                                     /              \
                                   3. Query Live Location (Memory)  /                \ 4. Append History Log
                                                                   v                  v
                                                         +------------------+  +--------------------+
                                                         | Redis Location   |  | Cassandra / Redis  |
                                                         | Cache (Latest)   |  | Time-Series Store  |
                                                         +------------------+  +--------------------+
                                                                   |
                                                                   | 5. Stream to Authorized Receivers
                                                                   v
                                                         +------------------------------------+
                                                         | AUTHORIZED CONTACT MOBILE CLIENT   |
                                                         +------------------------------------+
```

### Key Technical Mechanics
1. **Time-Series Location Storage Engine:** Stores continuous location breadcrumbs in Cassandra or Redis TimeSeries:
   - Primary Key: `(user_id, timestamp)`.
   - Allows fast time-range queries to render historical movement trajectories (e.g., *"Show route taken between 2 PM and 3 PM"*).
2. **Cryptographic Privacy & Permission Boundaries:** Enforces explicit permission checks before streaming location data. Sharing sessions support auto-expiring TTL timers (e.g., *"Share location for 1 hour"*).
3. **Location Telemetry Compression:** Uses Delta Encoding to compress continuous GPS breadcrumbs (X_t - X_t-1), reducing network bandwidth and time-series storage size by up to 80%.

### API Interface Specifications

| Endpoint / Protocol | Type | Request Payload | Response Payload |
|---|---|---|---|
| `WS /v1/share/stream`| WebSocket | `{"sharing_id": "s_99", "lat": 37.7749, "lng": -122.4194, "speed": 12.4}` | `{"status": "ACK"}` |
| `/api/v1/share/start`| POST | `{"target_user_id": "u_42", "duration_minutes": 60}` | `{"sharing_id": "s_99", "expires_at": 1700003600}` |
| `/api/v1/share/history`| GET | `{"sharing_id": "s_99", "start_time": 1700000000, "end_time": 1700003600}`| `{"breadcrumbs": [{"lat": 37.77, "lng": -122.41, "ts": 1700000010}, ...]}` |

### Time-Series Location Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `sharing_id` | UUID | Cassandra / Redis TS | Primary partition key representing the active location sharing session. |
| `timestamp` | Int64 (Unix Epoch) | Cassandra Clustering Key| Time-series clustering key (Ordered DESC). |
| `lat` / `lng` | Double | Cassandra | GPS coordinates. |
| `accuracy_meters` | Float | Cassandra | GPS accuracy radius metric. |
| `battery_level` | Integer (0-100) | Redis / Cassandra | Sender device battery percentage displayed to recipient. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Cassandra Time-Series Breadcrumb Storage**| High write throughput for continuous GPS telemetry; fast time-range queries. | Requires disk compaction tuning to handle continuous deletion of expired location logs. | Live location tracking and history playback platforms. |
| **Delta-Encoded GPS Trajectory Compression**| Reduces network data usage and storage payload size by up to 80%. | De-compression requires decoding sequential breadcrumbs from initial reference point. | Mobile devices streaming GPS coordinates over cellular data. |
| **Ephemeral Session TTL Expiration** | Guarantees user location privacy by automatically terminating sharing links when time expires. | User must explicitly renew sharing session if longer tracking is needed. | Privacy-focused location sharing applications. |

### Key takeaway
A **Location Sharing System** tracks live movement using **WebSocket telemetry streams**, persisting historical breadcrumbs in **Cassandra Time-Series databases** with Delta-encoded compression and auto-expiring TTL privacy controls.
