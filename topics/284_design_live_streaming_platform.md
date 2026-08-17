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
| **RTMP** | TCP | 3-5 seconds | Legacy broadcaster ingest to server. |
| **WHIP (WebRTC)**| UDP | < 1 second | Ultra-low latency broadcaster ingest. |
| **LL-HLS / DASH**| HTTP / TCP | 2-4 seconds | Mass audience distribution via standard CDNs. |

### Ingest & Transcoding Pipeline Details
- **Ingest segregation**: one broadcaster per ingest node slot with a regional endpoint close to them; RTMP over TCP hurts on bad uplinks, so WHIP/WebRTC (UDP with congestion control) is the modern path for sub-second sources.
- **Transcoder topology**: a segmented pipeline — decode once, fan out parallel encoders per ABR rendition (1080p/720p/480p), re-mux — GPU instances for density, autoscaled on concurrent channels, not viewer count (viewers never touch transcoders, only the CDN).
- **Keyframe alignment**: all renditions must cut segments on identical keyframe boundaries, or players stutter when switching bitrates mid-stream.
- **Segment sizing trade-off**: shorter segments (1s) shrink latency but raise encoding and CDN request overhead; LL-HLS splits segments into parts to get both.

### Playback at Scale
| Concern | Design |
| :--- | :--- |
| **Million-viewer fan-out** | CDN absorbs it — one origin fetch per edge PoP per segment; the origin never sees viewer traffic. |
| **Chat alongside video** | Chat is a separate fan-out problem (WebSockets/pub-sub) with its own backpressure — drop oldest on overflow, never block video. |
| **DVR / rewind** | Persist segments to object storage with a sliding 6-hour window; the manifest server stitches windows on demand. |
| **Ad insertion** | Server-side ad stitching (SSAI) splices ad segments into the manifest so ad-blockers can't distinguish them. |

### Failure Modes
- **Broadcaster uplink drops**: ingest watchdog after N silent seconds → show "reconnecting" slate to viewers, buffer recent segments for gap-fill on return.
- **Transcoder crash mid-stream**: channel state (codec params, timestamps) checkpoints per segment; a replacement resumes from the last completed segment with a visible-but-brief quality dip.
- **CDN origin outage**: multi-CDN manifests let players fail over between providers mid-stream.

### Key takeaway
Live streaming platforms ingest broadcaster feeds via RTMP/WHIP, transcode video into Adaptive Bitrate profiles in real time, and deliver content to viewers via low-latency HLS/DASH over global CDNs.
