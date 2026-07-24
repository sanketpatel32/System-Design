# Video Transcoding Pipeline

> **Category:** Storage Systems

---

A Video Transcoding Pipeline converts raw uploaded videos into **multiple resolutions, codecs, and adaptive streaming formats (HLS / DASH)** to support seamless playback across diverse devices and network speeds.

### Distributed Pipeline Architecture

```
+------------------------+      1. Video Created Event      +------------------------+
| Transcode Queue (Kafka)| -------------------------------> | Pipeline Orchestrated  |
+------------------------+                                  +------------------------+
                                                                         |
                                     +-----------------------------------+-----------------------------------+
                                     | 2. Split Video into 10s Chunks                                        |
                                     v                                                                       v
                         +------------------------+                                              +------------------------+
                         | Transcode Worker A     |                                              | Transcode Worker B     |
                         | (Chunk 0-10s -> 1080p)|                                              | (Chunk 10-20s -> 720p) |
                         +------------------------+                                              +------------------------+
                                     |                                                                       |
                                     +-----------------------------------+-----------------------------------+
                                                                         v 3. Merge & Generate Playlists
                                                            +------------------------+
                                                            | Manifest Builder       |
                                                            | (Creates master.m3u8)  |
                                                            +------------------------+
                                                                         |
                                                                         v 4. Sync to Object Store
                                                            +------------------------+
                                                            | CDN / S3 Storage       |
                                                            +------------------------+
```

### Transcoding Pipeline Stages

1. **Preprocessing & Segmentation**: Demuxes source file and splits raw video into uniform 2-10 second GOP (Group of Pictures) chunks.
2. **Parallel Chunk Transcoding**: Distributes chunk encoding across GPU worker pools in parallel.
3. **Adaptive Bitrate Encoding**: Produces profile variants (1080p @ 6Mbps, 720p @ 3Mbps, 480p @ 1Mbps) using codecs like H.264, H.265 (HEVC), or AV1.
4. **Manifest Assembly**: Generates playlist index files (`.m3u8` for HLS or `.mpd` for DASH) detailing chunk segment URLs.

### Transcoding Profile Matrix

| Resolution | Video Bitrate | Audio Bitrate | Frame Rate | Typical Target Device |
| :--- | :--- | :--- | :--- | :--- |
| **1080p (FHD)** | 5,000 - 8,000 kbps | 192 kbps | 60 fps | Smart TVs, Desktop Monitors |
| **720p (HD)** | 2,500 - 4,000 kbps | 128 kbps | 30 fps | Tablets, High-end Mobile |
| **480p (SD)** | 1,000 - 1,500 kbps | 96 kbps | 30 fps | Standard Mobile Networks |
| **360p (Low)** | 400 - 700 kbps | 64 kbps | 24 fps | Low Bandwidth 3G Connections |

### Engineering Considerations & Cost Optimization

- **Spot Instance Utilization**: Transcoding is stateless; execute video chunk rendering on low-cost spot instance worker pools.
- **Priority Queuing**: Process short clips or premium user uploads ahead of batch background archival videos.

### Key takeaway

Speed up video transcoding by **chunking source files into short time segments**, processing chunks across parallel GPU worker pools, and outputting HLS/DASH manifest playlists.
