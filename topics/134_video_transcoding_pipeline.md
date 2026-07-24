# Video Transcoding Pipeline

> **Category:** Storage Systems

---

A video transcoding pipeline transforms raw source videos into multiple **resolutions (1080p, 720p, 480p), bitrates, and adaptive streaming formats (HLS/DASH)**. It enables seamless playback across diverse end-user devices and network speeds.

### Distributed Transcoding Pipeline Architecture

The pipeline processes raw uploaded videos by splitting them into small temporal segments, encoding segments in parallel across worker pools, and manifest generating for playback.

```
+--------------------+      1. Event Trigger      +--------------------+      2. Split Video      +--------------------+
|  S3 Raw Bucket     | -------------------------> |  Video Splitter    | -----------------------> |  Task Dispatcher   |
|  (Source MP4)      |                            |  (FFmpeg / GOP)    |                          |  Queue (Kafka)     |
+--------------------+                            +--------------------+                          +--------------------+
                                                                                                            |
                                                                             3. Assign Segments to Worker Pool
                                                                                                            v
+--------------------+                            +--------------------+                          +--------------------+
| Segment Worker 1   |                            | Segment Worker 2   |                          | Segment Worker N   |
| (1080p H.264)      |                            | (720p H.264)       |                          | (480p H.264)       |
+--------------------+                            +--------------------+                          +--------------------+
          \                                                 |                                               /
           \------------------------------------------------+----------------------------------------------/
                                                            | 4. Stitch Segments & Generate Manifests (.m3u8)
                                                            v
                                            +-------------------------------+
                                            |  S3 Transcoded Output Bucket  |
                                            |  - master.m3u8                |
                                            |  - /1080p/index.m3u8 + .ts    |
                                            |  - /720p/index.m3u8 + .ts     |
                                            +-------------------------------+
```

### Video Codecs & Streaming Protocols Matrix

| Standard / Protocol | Type | Key Characteristic / Use Case | Compression Efficiency |
| :--- | :--- | :--- | :--- |
| **H.264 (AVC)** | Video Codec | Universal hardware decoding compatibility (100% devices) | Baseline |
| **H.265 (HEVC)** | Video Codec | 50% better compression than H.264; required for 4K/HDR | High (Licensing fee costs) |
| **AV1** | Video Codec | Royalty-free next-gen open codec | Highest (Heavy CPU encoding cost) |
| **HLS (HTTP Live Streaming)**| Streaming Protocol| Apple-backed; streams `.ts` / `.m4s` chunks via `.m3u8` manifests | Universal Web/Mobile Playback |
| **DASH (Dynamic Streaming)** | Streaming Protocol| ISO standard; XML `.mpd` manifest streaming | Android / Smart TV native |

### Step-by-Step Transcoding Workflow

1. **GOP-Based Video Splitting**: The video is split at Group of Pictures (GOP) keyframe boundaries into short 2-10 second segment chunks.
2. **Parallel Transcoding Tasks**: Segment chunks are processed in parallel on GPU/CPU worker instances, producing ladder resolutions (1080p, 720p, 480p, 360p).
3. **Audio Extraction & Multi-Track**: Audio tracks are extracted into AAC/Opus formats and aligned with localized subtitle tracks.
4. **Stitching & Manifest Assembly**: Transcoded chunks are assembled into output buckets alongside HLS `.m3u8` playlist manifests.

### Key Trade-offs & Cost Engineering

- ✅ **Optimized Quality of Experience (QoE)**: Users automatically stream resolution matching their dynamic bandwidth.
- ❌ **Massive Compute & Cost**: Encoding video into 5 resolution ladders across multiple codecs demands high GPU computing power.
- ❌ **Storage Amplification**: Storing multiple bitrate variants increases output storage footprint by 3x-5x compared to the raw file.

### Key takeaway

A video transcoding pipeline uses **GOP video splitting and parallel encoding workers** to output adaptive bitrate formats (HLS/DASH), delivering smooth playback across varying network conditions.
