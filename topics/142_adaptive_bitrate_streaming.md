# Adaptive Bitrate Streaming

> **Category:** CDN and Media Delivery

---

Adaptive Bitrate Streaming (ABR) dynamically detects a client's **real-time network bandwidth and CPU capacity**, switching between higher and lower video quality profiles mid-stream without playback interruption.

### ABR Switching Workflow

```
+-----------------------------------------------------------------------------------+
|                            Video Player Client Engine                             |
+-----------------------------------------------------------------------------------+
                                          |
    +-------------------------------------+-------------------------------------+
    | 1. High Bandwidth Detected (10 Mbps)|                                     | 2. Bandwidth Drops (1.5 Mbps)
    v                                                                           v
+-----------------------------------------+                 +-----------------------------------------+
| Fetch 1080p Segment (chunk_004_1080.ts) |                 | Fetch 480p Segment (chunk_005_480.ts)   |
+-----------------------------------------+                 +-----------------------------------------+
    |                                                                           |
    +-------------------------------------+-------------------------------------+
                                          v
+-----------------------------------------------------------------------------------+
|                        Continuous Playback Output (Zero Stutter)                  |
+-----------------------------------------------------------------------------------+
```

### ABR Manifest Structure (`master.m3u8`)

```m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080
1080p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480
480p/index.m3u8
```

### Quality Profiles & Adaptation Parameters

| Profile Level | Resolution | Target Bitrate | Frame Rate | Network Threshold |
| :--- | :--- | :--- | :--- | :--- |
| **Ultra HD** | 3840x2160 | 15,000 kbps | 60 fps | > 25 Mbps |
| **High** | 1920x1080 | 6,000 kbps | 60 fps | > 8 Mbps |
| **Medium** | 1280x720 | 3,000 kbps | 30 fps | > 4 Mbps |
| **Low** | 640x360 | 800 kbps | 30 fps | < 1.5 Mbps |

### Key Adaptation Metrics

- **Buffer Occupancy**: If player buffer falls below threshold (e.g. < 5 seconds), trigger immediate downshift to lower bitrate variant.
- **Segment Keyframe Alignment**: All quality profiles must feature identical frame timestamps across GOP boundaries for seamless switching.

### Key takeaway

ABR eliminates video buffering by **providing multi-bitrate segment variants**, enabling client video players to adjust stream quality dynamically as network conditions fluctuate.
