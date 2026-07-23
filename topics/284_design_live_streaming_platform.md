# Design Live Streaming Platform

> **Category:** Real-Time Systems

---

See **#143 Live Streaming Basics** for the streaming side.

### Platform features
- Broadcaster ingest (RTMP, WebRTC).
- Real-time transcode.
- HLS distribution via CDN.
- Chat alongside stream.
- Recording to VOD.
- Donations / subscriptions.

### Architecture
```
[Broadcaster] -> [Ingest] -> [Transcoder] -> [Packager] -> [Origin] -> [CDN] -> [Viewers]
                                                                      ^
[Chat] <---------------------------------------------------------------+
```

### Chat
- High-volume, real-time.
- WebSocket per viewer.
- Rate-limit + moderate.

### Scaling
- Auto-scale transcoders.
- CDN absorbs viewer reads.
- Chat via pub/sub.

### Key takeaway
Live streaming platform = ingest → transcode → packager → origin → CDN → viewers. Chat alongside
via WebSocket + pub/sub. Recording simultaneously to VOD. Auto-scale transcoding.
