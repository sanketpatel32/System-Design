# Design Zoom
> **Category:** Intermediate System Design Problems

---

### Overview
**Zoom** is a cloud-based video conferencing service providing real-time video, audio, and screen-sharing sessions for up to 1,000 video participants per meeting. The system delivers sub-150ms glass-to-glass video latency across unpredictable global networks.

Core engineering relies on **WebRTC over UDP (SRTP)**, **Selective Forwarding Unit (SFU)** media routing, dynamic multi-bitrate simulcasting, and edge Multimedia Routers.

### System Architecture & Video Routing Topology

```
+------------------+                    UDP / SRTP STREAM                     +------------------+
| Speaker Client   | =======================================================> | Zoom Multimedia  |
| (Video 1080p)    |           1. Multi-Bitrate Simulcast (1080p, 720p, 360p)  | Router (SFU)     |
+------------------+                                                          +------------------+
                                                                                       |
                                        UDP / SRTP PACKET ROUTING                      |
                     +-----------------------------------------------------------------+
                     | 2. Route Active Speaker (1080p) & Gallery Thumbnails (180p)
                     v
+------------------------------------+                                        +------------------------------------+
| Viewer Client A (Desktop - 1080p)  |                                        | Viewer Client B (Mobile - 360p)    |
+------------------------------------+                                        +------------------------------------+
```

### Key Technical Mechanics
1. **Selective Forwarding Unit (SFU) Router:** Zoom Multimedia Routers do NOT decode, re-encode, or mix video frames in memory. Instead, SFUs inspect incoming SRTP packet headers and route raw encrypted H.264/VP9/AV1 video packets directly to participants, keeping latency **< 150ms**.
2. **Simulcasting (Multi-Bitrate Stream Transmission):** Speaker client encodes video into 3 distinct resolution streams simultaneously (1080p, 720p, 180p). The SFU forwards high-res 1080p stream to the active speaker view and 180p streams for small gallery thumbnails.
3. **Adaptive UDP Congestion Control:** Custom congestion control protocol built over UDP that adapts packet loss FEC (Forward Error Correction) and frame rate dynamically based on network jitter.

### API Interface Specifications

| Endpoint / Protocol | Type | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v2/meetings/create` | HTTPS POST | `{"topic": "Design Sync", "type": 2, "duration": 40}` | `{"meeting_id": "849 201 482", "join_url": "https://zoom.us/j/849201482"}` |
| `UDP / SRTP Media Stream` | UDP Socket | SRTP Encrypted Video/Audio Packets | Low-latency media frame transfer. |

### Meeting Session Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `meeting_id` | String (9-11 Digits)| MySQL / Spanner | Unique meeting room identifier. |
| `host_user_id` | String | Relational DB | Host account ID. |
| `assigned_sfu_ip` | String | Memory / Route Table | IP address of assigned Zoom Multimedia Router (SFU). |
| `active_participants`| Integer | Redis Cache | Counter tracking connected participants. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **SFU (Selective Forwarding) vs MCU**| Low server CPU consumption; sub-150ms video latency; scales to hundreds of users per room. | Higher client downstream bandwidth required for receiving multiple video streams. | Modern real-time video conferencing platforms. |
| **UDP (SRTP) over TCP** | Zero head-of-line blocking; minimal network transmission latency. | Packets can be dropped by bad networks; requires FEC (Forward Error Correction) redundancy. | Real-time video/audio streaming. |
| **Client Simulcasting (Multi-Stream)**| Allows router to serve mobile and 4K desktop clients from single publisher without server transcoding.| Increased upload bandwidth requirement on video speaker device. | Multi-device interactive video meetings. |

### Key takeaway
**Zoom** achieves sub-150ms video latency using **Selective Forwarding Units (SFUs)** over **UDP/SRTP**, routing multi-bitrate **Simulcast video streams** directly between clients without server-side video transcoding.
