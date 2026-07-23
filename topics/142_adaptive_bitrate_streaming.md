# Adaptive Bitrate Streaming

> **Category:** CDN and Media Delivery

---

Adaptive Bitrate Streaming (ABR) = **serving multiple quality levels and letting the client
switch dynamically based on bandwidth.**

### How it works
```
1. Server encodes video at multiple bitrates:
   240p @ 400kbps, 480p @ 1Mbps, 720p @ 2.5Mbps, 1080p @ 5Mbps, 4K @ 25Mbps

2. Each variant has its own segment playlist (.m3u8).

3. Master playlist lists all variants.

4. Client picks a variant based on measured bandwidth.

5. As bandwidth changes, client switches variants mid-playback.
```

### Why ABR
- **Mobile users** with variable bandwidth.
- **Avoid buffering** — drop to lower quality instead of stalling.
- **Best quality** when bandwidth allows.
- **Progressive enhancement**.

### Bitrate ladders
- Studios design "ladders" of bitrates optimized for content type.
- Example for movies:
  - 240p @ 400kbps (slow mobile)
  - 360p @ 800kbps
  - 480p @ 1.5Mbps (fast mobile)
  - 720p @ 3Mbps (WiFi)
  - 1080p @ 6Mbps (broadband)
  - 4K @ 16Mbps (fiber)

### Client logic (ABR algorithm)
- **Throughput-based**: estimate bandwidth from recent downloads.
- **Buffer-based**: switch based on buffer fill level.
- **Hybrid**: combine both.
- ABR algorithms: Netflix's, Akamai's, YouTube's.

### Switching
- Switch at segment boundary (every ~10s).
- Avoid mid-segment switch (would break playback).
- Switch smoothly — don't oscillate too aggressively.

### Per-title encoding
- Netflix analyzes content complexity.
- Action scenes need higher bitrate than static scenes.
- Assigns per-title bitrates accordingly.

### Key takeaway
ABR encodes at multiple bitrates; client picks based on bandwidth and switches seamlessly.
Delivers the best quality each user's connection can sustain. Industry standards: HLS, DASH.
