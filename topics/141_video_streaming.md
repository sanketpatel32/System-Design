# Video Streaming

> **Category:** CDN and Media Delivery

---

Video streaming delivers video assets over IP networks by breaking continuous video tracks into small sequential media segments (typically 2 to 10 seconds long). Instead of downloading an entire video file before playback begins, the client media player progressively fetches and buffers media segments via HTTP REST calls to CDN edge nodes.

### Video Streaming Architecture

Video content is transcoded into media segments (`.ts` or `.m4s`) and indexed inside playlist manifests (`.m3u8` or `.mpd`), which clients read to drive progressive buffer fetching.

```
+---------------+     1. HTTP GET /master.m3u8 (Manifest)     +-------------------+
|  Client Media | -----------------------------------------> |  CDN Edge Server  |
|  Player       | <----------------------------------------- |  (Cached Assets)  |
+---------------+     2. Returns Manifest (.m3u8)            +-------------------+
        |                                                             |
        | 3. Sequentially Request Segments (segment_001.ts, 002.ts)   |
        +-------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------------------------+
| Client Video Buffer (RAM)                                                       |
| [ Segment 1 (Buffered) ] [ Segment 2 (Buffered) ] [ Segment 3 (Fetching...) ]   |
+---------------------------------------------------------------------------------+
        |
        v Continuous Rendering
+---------------------------------------------------------------------------------+
| Screen Video Decoder / Playback                                                 |
+---------------------------------------------------------------------------------+
```

### Video Streaming Protocols Comparison Matrix

| Protocol | Standardizing Body | Manifest File Format | Segment Container | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **HLS (HTTP Live Streaming)**| Apple / IETF | Master & Variant `.m3u8` | MPEG-2 TS (`.ts`) or fMP4 (`.m4s`) | Universal Web, iOS, macOS, Smart TVs |
| **DASH (Dynamic Adaptive)** | ISO / IEC | Media Presentation Description `.mpd` | Fragmented MP4 (`.m4s`) | Android, Smart TVs, Web Browsers |
| **WebRTC** | IETF / W3C | SDP (Session Description Protocol) | Raw RTP/SRTP Packets over UDP | Ultra-Low Latency (<1s) Interactive Video |
| **RTSP / RTMP** | Legacy Adobe / IETF | Stream Negotiation | Flv / Binary Packets | First-mile ingest from camera to encoder |

### Key Streaming Concepts & Mechanics

1. **Progressive Download vs Streaming**: Progressive download relies on a single MP4 file; video streaming chunks files dynamically, enabling fast seeking and resolution switching.
2. **Buffer Management**: Players maintain a 15-30 second buffer in RAM. If buffer occupancy drops below 3 seconds, the player requests lower resolution segments to prevent rebuffering spinners.
3. **Byte-Range Requests**: Clients use HTTP `Range: bytes=1000-2000` headers to request exact media frames during fast-forwarding or seeking.

### Key Trade-offs & Engineering Considerations

- ✅ **Instant Playback Start**: Playback begins within 1-2 seconds after fetching the initial index manifest and first segment.
- ✅ **CDN Infrastructure Compatibility**: Uses standard HTTP port 80/443 GET requests, making streaming compatible with standard web caches.
- ❌ **Storage Footprint**: Segmenting and duplicating videos across multiple qualities inflates overall storage usage.
### Production HLS Master Playlist Manifest Example (`master.m3u8`)

```m3u8
#EXTM3U
#EXT-X-VERSION:6

# 1080p High-Quality Stream Variant
#EXT-X-STREAM-INF:BANDWIDTH=4500000,RESOLUTION=1920x1080,CODECS="avc1.64002a,mp4a.40.2"
1080p/index.m3u8

# 720p Medium-Quality Stream Variant
#EXT-X-STREAM-INF:BANDWIDTH=2200000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
720p/index.m3u8

# 480p Low-Quality Stream Variant
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480,CODECS="avc1.4d401f,mp4a.40.2"
480p/index.m3u8
```

### Media Player Buffer Management Algorithm

```
+----------------------------------------------------------------------------------------------------+
| Player Read Loop                                                                                   |
|                                                                                                    |
|  1. Inspect Buffer Level:                                                                          |
|     - If Buffer < 5s  --> Issue immediate request for 480p segment (Prevents stall!)             |
|     - If Buffer > 20s --> Issue request for 1080p segment (Upgrades visual quality!)              |
|                                                                                                    |
|  2. Fetch segment via HTTP GET -> Append binary bytes to SourceBuffer -> Decode & Play             |
+----------------------------------------------------------------------------------------------------+
```

### Key takeaway

Video streaming delivers video over standard HTTP protocols by **chunking video into small segment files indexed by playlist manifests**, providing fast initial playback start and buffer management.
