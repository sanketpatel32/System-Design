# Video Streaming

> **Category:** CDN and Media Delivery

---

Video Streaming delivers continuous video content to clients over HTTP by breaking continuous video tracks into **short file segments (chunks)** downloaded sequentially via manifest files.

### Streaming Architecture

```
+---------------+           1. Request Playlist (.m3u8)           +---------------+
| Video Player  | ----------------------------------------------> | CDN Edge Node |
+---------------+                                                 +---------------+
    |                                                                     |
    | 2. Parse Segment List (segment_001.ts, segment_002.ts...)          |
    |                                                                     v
    | 3. Sequential Chunk HTTP GETs                               +---------------+
    +-----------------------------------------------------------> | Object Store  |
                                                                  +---------------+
```

### Core Protocols Matrix

| Protocol | Transport | Latency Range | Manifest Format | Supported Platforms |
| :--- | :--- | :--- | :--- | :--- |
| **HLS (HTTP Live Streaming)** | HTTP / TCP | 6 - 30 seconds | `.m3u8` (Playlist) | Apple iOS, Safari, Web, Android |
| **DASH (Dynamic Adaptive)** | HTTP / TCP | 6 - 30 seconds | `.mpd` (XML Manifest)| Android, Web, Smart TVs |
| **Low-Latency HLS (LL-HLS)**| HTTP / TCP | 1 - 3 seconds | Partial `.m3u8` | Safari, Modern Web Players |
| **WebRTC** | UDP | < 1 second | Peer Connection SDP | Interactive Video Calls, Webinars |

### Key Streaming Concepts

- **Group of Pictures (GOP)**: Grouping of video frames starting with an I-Frame (keyframe). Streaming segments align to GOP boundaries.
- **Client Buffer Management**: Video player buffers 10–30 seconds of video chunks in memory to absorb transient network jitter.

### Key takeaway

Video streaming relies on **HTTP chunk delivery (HLS/DASH)** where client players parse index manifests to fetch and buffer short video segments cleanly without connection interruptions.
