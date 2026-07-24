# Live Streaming Basics

> **Category:** CDN and Media Delivery

---

Live streaming ingests, processes, and broadcasts **real-time audio and video content to millions of concurrent viewers simultaneously**. Unlike On-Demand video (VOD), live streaming requires low-latency first-mile ingestion (RTMP/SRTP), real-time chunk segmenting, and low-latency delivery protocols (LL-HLS, WebRTC).

### End-to-End Live Streaming Architecture

The streaming pipeline converts live RTMP camera feeds into distributed HTTP segment chunks delivered via CDN edge PoPs.

```
+--------------------+        1. First-Mile RTMP Ingest        +--------------------+
|  Broadcaster Host  | --------------------------------------> |  Live Ingest       |
|  (OBS / Mobile)    |                                         |  Media Server      |
+--------------------+                                         +--------------------+
                                                                          |
                                                      2. Real-Time Transcoding & Chunking
                                                      (Generate 2s LL-HLS Segments)
                                                                          v
+--------------------+        4. Low-Latency Edge Fetch        +--------------------+
|  Viewer Client     | <-------------------------------------- |  CDN Edge Server   |
|  (Web / Mobile)    |                                         |  (Cached Segments) |
+--------------------+                                         +--------------------+
```

### Live Streaming Latency Tiers Matrix

| Streaming Tier | End-to-End Latency | Underlying Protocols | Primary Application |
| :--- | :--- | :--- | :--- |
| **Standard Live** | 15 - 30 seconds | Standard HLS / DASH | Large-scale broadcasts (Super Bowl, News) |
| **Low-Latency Live (LL-HLS)**| 2 - 5 seconds | LL-HLS (Partial Chunks), Chunked Transfer Encoding | Esports streaming, Twitch-style live chat sync |
| **Ultra-Low Latency**| Sub-1 second (< 1000ms) | WebRTC, WHIP, MediaOverQUIC | Live sports betting, interactive auctions, video calls |

### Key Technical Challenges in Live Streaming

1. **First-Mile Stability**: Broadcasters operate on unreliable residential upload links; encoders use **Adaptive Bitrate Ingest (RTMP/SRTP)** to prevent dropped video frames at source.
2. **Manifest Polling Frequency**: Live HLS manifests updated every 2 seconds must be fetched repeatedly by clients. CDNs must cache live manifests with very short TTLs (`max-age=1`).
3. **Thundering Herd at Start Time**: When millions of viewers join a live stream simultaneously, requests for the latest manifest file can overwhelm origin servers. CDNs use **Request Collapsing** to send only one origin fetch request per PoP.

### Key Trade-offs & Production Choices

- ✅ **Real-Time Audience Interaction**: Low latency enables live chat, Q&A, and interactive audience participation.
- ❌ **No Pre-Transcoding Cache**: Content cannot be pre-processed or pre-cached prior to broadcast, demanding high live GPU processing power.
- ❌ **Strict Infrastructure Cost**: Real-time compute and high bandwidth scale cost rapidly during peak viewer spikes.
### Low-Latency HLS (LL-HLS) Chunk Segment Structure

```
Standard HLS Segment (6 Seconds Latency):
[ 6-Second Media Segment 1 ] ---> [ 6-Second Media Segment 2 ]

Low-Latency HLS Partial Segments (1 Second Latency):
[ Part 1.1 (200ms) ][ Part 1.2 ][ Part 1.3 ][ Part 1.4 ][ Part 1.5 ] ---> Streamed via HTTP/2 Push!
```

### Production Live Stream Ingest & Broadcast Parameters

- **First-Mile Protocol**: RTMP over TCP (`rtmp://live.ingest.twitch.tv/app/{stream_key}`).
- **Keyframe Interval (GOP Size)**: Fixed 2 seconds (60 frames at 30fps). Guarantees segment boundaries align perfectly across transcoders.
- **Segment TTL at CDN**: `.m3u8` manifests set `Cache-Control: max-age=1`, while completed `.ts` audio/video segments set `Cache-Control: max-age=3600`.

### Key takeaway

Live streaming balances **ingest protocols (RTMP/SRTP) and low-latency delivery (LL-HLS/WebRTC)** to stream real-time broadcasts to concurrent global audiences with minimal latency.
