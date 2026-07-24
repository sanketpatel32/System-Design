# Design Netflix
> **Category:** Intermediate System Design Problems

---

### Overview
**Netflix** is a global subscription video streaming service accounting for over 15% of global downstream internet traffic. The system architecture is divided into two distinct realms: the **Control Plane** (running in AWS microservices for user auth, recommendation ML models, billing, and search) and the **Data Plane / Media Delivery Network (Open Connect)**.

Core objectives demand **99.99% playback reliability**, custom edge hardware CDN delivery, and pre-computed personalized video encoding.

### System Architecture & Open Connect CDN Topology

```
+--------------------------------------------------------------------------+
| NETFLIX CONTROL PLANE (AWS Cloud Services)                               |
|  [ User Auth ] --> [ Recommendation ML ] --> [ Playback License Gateway] |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Authenticate & Get Playback License
+--------------------------------------------------------------------------+
| NETFLIX CLIENT APP (Smart TV / Mobile / Browser)                         |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Fetch Video Stream (Direct IXP Connection)
+--------------------------------------------------------------------------+
| NETFLIX OPEN CONNECT CDN (OCA Appliance Nodes inside ISP Networks)       |
| Hardware Appliances pre-loaded with encrypted video files during off-peak|
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Open Connect Appliance (OCA) Network:** Custom custom-built FreeBSD hardware CDN appliances deployed directly inside Internet Service Provider (ISP) datacenters and Internet Exchange Points (IXPs) globally. Over 95% of Netflix traffic is served directly from local ISP networks, bypassing public internet transit.
2. **Off-Peak Nightly Pre-Positioning:** Predicts user watching habits in specific regions and proactively pushes encrypted movie video files to local OCA appliances during off-peak night hours.
3. **Per-Title & Per-Shot Encoding:** Analyzes video complexity per frame shot (e.g., action scenes vs static cartoon scenes) to optimize compression, saving up to 20% bandwidth while improving visual fidelity.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/playback/license`| POST | `{"movie_id": "m_881", "device_id": "tv_99", "drm_type": "WIDEVINE"}` | `{"oca_url": "https://oca-lax.openconnect.netflix.com/...", "playback_license": "jwt_token"}` |
| `/api/v1/profiles/{id}/continue_watching`| GET | None | `{"items": [{"movie_id": "m_881", "progress_sec": 1420}]}` |

### Playback State & CDN Storage Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `playback_id` | UUID | Cassandra / CockroachDB | Unique identifier for active playback session. |
| `user_id` / `profile_id`| String | Relational DB | Subscriber profile ID. |
| `movie_id` | String | Relational DB | Movie/Episode catalog ID. |
| `last_playback_pos_sec`| Integer | Cassandra / DynamoDB | Continuously updated timestamp for "Continue Watching" feature. |
| `oca_node_ip` | String | Memory / Route Table | Local ISP Open Connect CDN Appliance IP address. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Custom Open Connect CDN Appliances**| Bypasses public internet congestion; saves massive CDN transit costs; sub-second playback startup. | High capital expenditure (CapEx) to build, deploy, and maintain physical hardware nodes globally. | Tier-1 global media streaming giants (Netflix, Disney+). |
| **Off-Peak Nightly Video Pushing** | Eliminates daytime backbone network congestion when transferring huge 4K video files. | Requires accurate predictive algorithms to determine which titles to cache at each ISP node. | High-demand subscription VOD platforms. |
| **Per-Shot Encoding Optimization** | Minimizes bandwidth usage per title without degrading visual stream quality. | Massive CPU/GPU encoding compute workload during content ingestion phase. | Large static video catalog archives. |

### Key takeaway
**Netflix** minimizes streaming latency and network costs by separating control plane microservices in AWS from the data plane, serving > 95% of video traffic directly from custom **Open Connect CDN Appliances (OCA)** embedded inside local ISP networks.
