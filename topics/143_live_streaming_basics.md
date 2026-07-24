# Live Streaming Basics

> **Category:** CDN and Media Delivery

---

Live Streaming ingests real-time audio/video feeds from broadcasters, transcodes content on-the-fly into live segment streams, and distributes segments to millions of concurrent viewers via CDNs with low latency.

### Live Architecture Pipeline

```
+-------------+       1. RTMP / SRT Push Feed       +-----------------------+
| Broadcaster | ----------------------------------> | Ingestion Service     |
+-------------+                                     +-----------------------+
                                                                |
                                                                v 2. Real-Time Segmenting
                                                    +-----------------------+
                                                    | Live Transcode Engine |
                                                    +-----------------------+
                                                                |
                                                                v 3. Short Chunks (2s)
                                                    +-----------------------+       4. Fetch Segments      +-------------+
                                                    | CDN Edge Origin Shield| ---------------------------> | Viewers     |
                                                    +-----------------------+                              +-------------+
```

### Live Ingestion vs Distribution Protocols

| Phase | Protocol | Latency | Reliability Mechanism | Primary Role |
| :--- | :--- | :--- | :--- | :--- |
| **Ingest (Broadcaster -> Server)**| RTMP / SRT | < 1 second | TCP Retries / FEC | Pushing raw video from OBS |
| **Transcode & Package** | Internal Pipeline | Sub-second | In-Memory Processing | Generating 2s HLS segments |
| **Distribution (Server -> Viewer)**| LL-HLS / WebRTC | 1 - 5 seconds | CDN Caching / HTTP GET| Mass fanout to 1M+ viewers |

### Architectural Challenges at Scale

- **Thundering Herd Effect**: Millions of clients requesting updated manifest files (`playlist.m3u8?seq=1024`) every 2 seconds simultaneously. Solved via CDN Origin Shielding and short edge TTL caching (1 second).
- **Hot-Key Storage Bottleneck**: Pushing live manifest updates to distributed memory stores (Redis) rather than persistent databases.

### Key takeaway

Scale live streaming by using **RTMP/SRT for broadcaster ingestion**, real-time chunk segmenters for 2-second HLS slice generation, and **CDN origin shields** to withstand thundering herd viewer traffic.
