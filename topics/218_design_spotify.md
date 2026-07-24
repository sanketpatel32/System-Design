# Design Spotify
> **Category:** Intermediate System Design Problems

---

### Overview
**Spotify** is an audio streaming platform delivering instant, gapless playback of millions of music tracks, podcasts, synced lyrics, and real-time social listening sessions.

### Architecture Topology Diagram

```
+---------------+     1. Play Track Request     +-------------------+
| Client App    | ----------------------------> | API Gateway       |
+---------------+                               +-------------------+
        |                                                 |
        | 4. Stream Audio Bytes                           v 2. Fetch Track Metadata & Token
        |                                       +-------------------+
        v                                       | Audio API Service |
+-------------------+                           +-------------------+
| Audio CDN         |                                     |
| (AES Encrypted    | <-----------------------------------+
| Ogg Vorbis/AAC)   | 3. Pre-fetch Chunk URLs
+-------------------+
```

### Key Technical Subsystems

| Feature | Engineering Strategy |
|---|---|
| **Audio Compression** | Encoded in **Ogg Vorbis** (96, 160, 320 kbps) and **AAC** for universal device support. |
| **Gapless Playback** | Client pre-fetches the first 5 seconds of the *next* track in playlist while current track finishes playing. |
| **Synced Lyrics** | Real-time WebSocket timestamp sync matching audio track playback position. |
| **Discover Weekly** | Offline batch calculation using **Collaborative Filtering** and **Word2Vec** audio embedding models. |

### Low-Latency Audio Streaming Pipeline
Audio files are split into small 5-second encrypted byte ranges. Client buffers audio data locally in a ring buffer to survive transient network drops.

### Key takeaway
Spotify ensures zero-latency playback through **client-side ring-buffer pre-fetching** of the next track, serving encrypted **Ogg Vorbis** audio streams from edge CDNs.
