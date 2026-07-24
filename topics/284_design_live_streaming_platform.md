# Design Live Streaming Platform

> **Category:** Real-Time Systems

---

A Live Streaming Platform (e.g. Twitch, YouTube Live) ingests high-definition video feeds from broadcasters, transcodes them into multi-bitrate streams, and distributes them to millions of concurrent viewers with low latency.

### System Requirements
- **Functional Requirements**:
  - Broadcaster video ingestion via RTMP / WHIP (WebRTC).
  - Real-time cloud transcoding into Adaptive Bitrate (ABR) profiles (1080p, 720p, 480p).
  - Low-latency segment distribution (HLS / DASH / LL-HLS).
- **Non-Functional Requirements**:
  - Low Latency: Sub-3 second glass-to-glass latency for interactive streams.
  - High Scalability: Scale to millions of simultaneous viewers per stream.
  - High Availability: Uninterrupted playback without buffering or stream drops.

### System Architecture
```
[ Broadcaster OBS ] ---> [ RTMP / WHIP Ingestion Node ]
                                   |
                                   v
                    [ Cloud Video Transcoder Pool ]
                    (Multi-Bitrate H.264/HEVC Encoding)
                                   |
                                   v
                    [ HLS / DASH Segmenter Engine ]
                    (Creates .m3u8 manifests & .ts/.m4s chunks)
                                   |
                                   v
                    [ CDN Distribution Network ]
                                   |
                                   v
                    [ Viewers Mobile / Web Apps ]
```

### Streaming Protocols Comparison
| Protocol | Transport | Glass-to-Glass Latency | Use Case |
|---|---|---|---|
| **RTMP** | TCP | $3-5	ext{ seconds}$ | Legacy broadcaster ingest to server. |
| **WHIP (WebRTC)**| UDP | $< 1	ext{ second}$ | Ultra-low latency broadcaster ingest. |
| **LL-HLS / DASH**| HTTP / TCP | $2-4	ext{ seconds}$ | Mass audience distribution via standard CDNs. |

### Key takeaway
Live streaming platforms ingest broadcaster feeds via RTMP/WHIP, transcode video into Adaptive Bitrate profiles in real time, and deliver content to viewers via low-latency HLS/DASH over global CDNs.
