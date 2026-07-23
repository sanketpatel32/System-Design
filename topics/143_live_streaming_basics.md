# Live Streaming Basics

> **Category:** CDN and Media Delivery

---

Live streaming = **broadcasting video in real-time** to many viewers. Different from VOD:
encoding happens live, latency matters.

### Architecture
```
[Broadcaster] -RTMP/SRT-> [Ingest server] -transcode-> [HLS packager]
                                                          |
                                                          v
                                                    [Origin]
                                                          |
[Viewer] -HTTP-> [CDN] <-segments-                [Origin]
```

### Stages
1. **Ingest**: broadcaster sends video (RTMP, SRT, WebRTC).
2. **Transcode**: real-time encoding to multiple bitrates.
3. **Package**: split into HLS/DASH segments.
4. **Origin**: store segments briefly.
5. **CDN**: distribute segments to viewers.
6. **Playback**: client plays segments with small buffer.

### Latency
- **Standard HLS**: 10-30s (segment-based).
- **LL-HLS** (Low-Latency HLS): 2-5s.
- **WebRTC**: <500ms (true real-time, but doesn't scale as well).

### Trade-offs
| | Standard HLS | LL-HLS | WebRTC |
|--|--------------|--------|--------|
| Latency | 10-30s | 2-5s | <500ms |
| Scale | Millions | Millions | ~thousands |
| Complexity | Low | Medium | High |
| Use | Streams, events | Sports, news | Calls, games |

### Ingest protocols
- **RTMP**: classic, from Flash era, still dominant.
- **SRT**: modern, better over bad networks.
- **WebRTC**: ultra-low latency for interactive.

### Scaling
- Each viewer = a connection.
- CDN absorbs the read load.
- 100k concurrent viewers = a lot of bandwidth.
- Pre-warm CDN for expected events.

### Recording
- Optionally save the stream for VOD.
- Write to S3 while streaming.

### Use cases
- **Live sports** (Super Bowl, Olympics).
- **Concerts, events**.
- **Gaming** (Twitch, YouTube Live).
- **News, webinars**.
- **Surveillance**.

### Key takeaway
Live streaming = **RTMP ingest → real-time transcode → HLS segments → CDN**. Standard HLS has
10-30s latency (acceptable for most cases). For true real-time (<500ms), use WebRTC (sacrifices
scale).
