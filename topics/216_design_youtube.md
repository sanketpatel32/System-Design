# Design YouTube
> **Category:** Intermediate System Design Problems

---

### Overview
**YouTube** is a video-sharing platform handling high-volume video ingestion, multi-bitrate adaptive streaming, global CDN caching, view counting, and real-time search and recommendations.

### Transcoding & Streaming Pipeline

```
+--------+     1. Upload Raw Video (chunked)     +-------------------+
| Client | ------------------------------------> | Ingestion Gateway |
+--------+                                       +-------------------+
                                                           |
                                                           v 2. Store Raw File
                                                 +-------------------+
                                                 | Raw Storage (S3)  |
                                                 +-------------------+
                                                           |
                                                           v 3. Kafka Video Transcode Event
                                                 +-------------------+
                                                 | Transcoding Engine| (FFmpeg Workers)
                                                 | (HLS / DASH)      |
                                                 +-------------------+
                                                           |
                                                           v 4. Push Multi-Bitrate Chunks
+--------+     5. Adaptive Bitrate Manifest      +-------------------+
| Client | <------------------------------------ | Video CDN         |
+--------+        (.m3u8 / .mpd manifest)        +-------------------+
```

### Adaptive Bitrate Streaming Protocols (HLS / DASH)
Video files are split into small 2 - 6 second chunk files (`.ts` or `.m4s`) encoded at multiple bitrates (1080p, 720p, 480p).

```
Master Manifest (.m3u8)
├── 1080p_manifest.m3u8 -> [chunk_0.ts, chunk_1.ts, chunk_2.ts]
├── 720p_manifest.m3u8  -> [chunk_0.ts, chunk_1.ts, chunk_2.ts]
└── 480p_manifest.m3u8  -> [chunk_0.ts, chunk_1.ts, chunk_2.ts]
```

### Scalable View Counter Architecture
Directly incrementing a database counter on every video play crashes under viral loads.
- **Solution**: Aggregate views in **Redis buffers**, flushing batch updates to Cassandra every 10 seconds:

$$\text{Client Play Event} \longrightarrow \text{Kafka} \longrightarrow \text{Redis } \texttt{INCRBY video:123:views 500} \longrightarrow \text{DB Batch Write}$$

### Video Metadata Model (Cassandra Sharded by `video_id`)
```json
{
  "video_id": "v_99812a",
  "uploader_id": "usr_441",
  "title": "System Design Interview Guide",
  "duration_seconds": 1820,
  "manifest_url": "https://cdn.youtube.com/v_99812a/master.m3u8",
  "thumbnails": { "default": "...", "hq": "..." },
  "views_count": 1420900
}
```

### Key takeaway
YouTube scales video delivery using **Adaptive Bitrate Streaming (HLS/DASH)** via global **CDNs**, and offloads view-count write traffic using asynchronous **Redis/Kafka batch aggregators**.
