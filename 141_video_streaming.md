# Video Streaming

> **Category:** CDN and Media Delivery

---

Video streaming = **delivering video to users over the internet** with adaptive quality,
low-latency, and minimal buffering.

### Streaming protocols
| Protocol | Use |
|----------|-----|
| **HLS** (HTTP Live Streaming) | Apple-created, dominant, chunked TS files |
| **DASH** (Dynamic Adaptive Streaming) | Open standard, similar to HLS |
| **CMAF** | Common packaging for both HLS + DASH |
| **WebRTC** | Real-time (video calls, games) |

### HLS architecture
```
master.m3u8 (playlist of variants)
  |- 240p.m3u8 (segment list)
  |    |- seg0.ts, seg1.ts, seg2.ts, ...
  |- 480p.m3u8
  |- 1080p.m3u8
```
- Client picks variant based on bandwidth.
- Downloads segments (10s each) sequentially.
- Switches variant on bandwidth change.

### Why HLS dominates
- **Adaptive bitrate**: scales to client bandwidth.
- **HTTP-based**: works through firewalls / CDNs.
- **Apple-supported**: default on iOS.
- **Buffer-friendly**: segments decoupled from live.

### CDN's role
- Cache segments at edge.
- Most requests HIT → low latency.
- Pre-warm popular videos (e.g. new Netflix releases).
- Origin only sees cache misses.

### Adaptive bitrate
```
Client bandwidth: 10 Mbps
Picks 1080p (5 Mbps stream)

Bandwidth drops: 1 Mbps
Switches to 480p (1 Mbps stream)

Bandwidth recovers: 5 Mbps
Switches to 720p
```
Seamless — no buffering.

### Quality dimensions
- **Resolution**: 240p, 480p, 720p, 1080p, 4K, 8K.
- **Bitrate**: low (1 Mbps) to high (25 Mbps for 4K).
- **Codec**: H.264 (universal), H.265/HEVC (50% smaller), AV1 (open, modern).

### Live vs VOD
- **VOD**: pre-transcoded, segmented, cached on CDN.
- **Live**: real-time transcode + packaging, ~10-30s latency.

### Key takeaway
Video streaming = **transcode to HLS/DASH with multiple bitrates + CDN caches segments**.
Adaptive bitrate scales to client bandwidth. VOD pre-transcodes; live does it real-time.
