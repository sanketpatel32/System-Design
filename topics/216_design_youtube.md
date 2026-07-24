# Design YouTube
> **Category:** Intermediate System Design Problems

---

### Overview
**YouTube** is the world's largest video-sharing platform, ingesting over 500 hours of video content uploaded per minute. The system must support asynchronous video transcoding into multiple resolutions (1080p, 4K) and formats (H.264, VP9, AV1), sub-second video playback initialization, adaptive bitrate streaming (ABR), and global CDN distribution.

Core technical objectives prioritize **zero playback buffering**, distributed video chunking, global edge caching, and scalable view count tracking.

### System Architecture & Video Transcoding Pipeline

```
+------------------+     1. Direct Resumable Upload     +--------------------+
| Content Creator  | ---------------------------------> | Raw Video Bucket   |
| (Video File)     |                                    | (AWS S3 Temp Storage)
+------------------+                                    +--------------------+
                                                                  |
                                                                  | 2. S3 Event Notification
                                                                  v
+------------------+     5. Video Stream (HLS / DASH)   +--------------------+
| Client Viewer    | <--------------------------------- | Transcoding DAG    |
| (Adaptive Bitrate|                                    | Orchestrator Queue |
+------------------+                                    +--------------------+
         ^                                                        |
         | 4. Fetch Video Chunk Chunks                            | 3. Parallel Transcode Chunks
         |                                                        v
+--------------------------------------------------------------------------+
| GLOBAL VIDEO CDN NETWORK (CloudFront / Google Edge Cache)                |
| Stores HLS Master Playlists (.m3u8) & Video Segment Chunks (.ts / .m4s)  |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Adaptive Bitrate Streaming (ABR):** Uses **HLS (HTTP Live Streaming)** or **DASH (Dynamic Adaptive Streaming over HTTP)** protocols. Videos are split into 2 to 6-second chunk segments encoded at multiple resolutions (360p, 720p, 1080p, 4K) and bitrates. Player clients dynamically switch resolution based on real-time network bandwidth.
2. **DAG Transcoding Pipeline Engine:** Uses Directed Acyclic Graph (DAG) task schedulers (e.g., Apache Airflow / Temporal) to split raw videos into temporal chunks, transcode chunks in parallel across thousands of GPU worker nodes, and assemble final HLS master manifest files (`master.m3u8`).
3. **Eventually Consistent View Counter:** Uses in-memory Redis counters flushed asynchronously to database partitions to track millions of concurrent video views without database write lock bottlenecks.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/videos/upload-session`| POST | `{"title": "System Design Video", "size_bytes": 1073741824}` | `{"upload_url": "https://s3.amazonaws.com/raw/v99?sig=...", "video_id": "v_992"}` |
| `/api/v1/videos/{id}/manifest` | GET | None | Returns HLS Master Playlist `.m3u8` containing variant stream URLs. |
| `/api/v1/videos/{id}/view` | POST | `{"video_id": "v_992", "watch_time_sec": 45}` | `{"status": "ACK"}` |

### Video Metadata & Manifest Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `video_id` | String (Base64) | Bigtable / Spanner | Unique 11-character video ID (`dQw4w9WgXcQ`). |
| `uploader_user_id` | String | Relational DB | Content creator account ID. |
| `manifest_s3_key` | String | Relational DB | Path to HLS master playlist file in S3/CDN. |
| `resolutions_available`| Array of Strings | Relational DB | Available transcoded resolutions (`["360p", "720p", "1080p", "4k"]`). |
| `views_count` | BigInt | Redis / Cassandra | Total video view count. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **HLS / DASH Adaptive Bitrate Streaming**| Automatically adjusts video quality based on user Wi-Fi/Cellular strength; zero buffering. | High S3 storage overhead for storing 5+ transcoded video resolution variants. | Essential requirement for modern web and mobile video platforms. |
| **DAG Chunked Parallel Transcoding** | Reduces 1-hour 4K video transcoding duration from hours down to minutes. | High infrastructure cost and complex task orchestration logic. | Scalable video uploading and processing pipelines. |
| **In-Memory View Count Aggregation** | Protects database from write collapse during viral video view spikes. | View counts displayed to users are eventually consistent (lag by a few seconds). | High-traffic video platforms. |

### Key takeaway
**YouTube** achieves seamless video playback using **Adaptive Bitrate Streaming (HLS/DASH)**, splitting raw video uploads into parallel temporal chunks transcoded via **DAG Pipelines** and delivered through global edge CDNs.
