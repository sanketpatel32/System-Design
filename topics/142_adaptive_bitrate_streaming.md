# Adaptive Bitrate Streaming

> **Category:** CDN and Media Delivery

---

Adaptive Bitrate (ABR) Streaming dynamically adjusts the resolution and quality bitrate of video streams **in real time based on the client's current network throughput and CPU buffer state**. As network bandwidth fluctuates, the video player seamlessly switches between higher and lower quality segment streams without interrupting video playback.

### Adaptive Bitrate Architecture & Quality Switching Flow

The video player continuously measures segment download latency and RAM buffer health to select the optimal stream quality ladder segment for the next chunk request.

```
+----------------------------------------------------------------------------------------------------+
|                                    Video Player (Client Application)                               |
|                                                                                                    |
|  [ Bandwidth Estimator: 5 Mbps ]  ---> [ Buffer Level Monitor: Healthy (25s) ]                   |
|                                                     |                                              |
|                                                     v Select Next Segment Quality                  |
|                        Requests 1080p Segment (chunk_004_1080p.m4s)                                 |
+----------------------------------------------------------------------------------------------------+
                                                      |
                                          HTTP GET Request (CDN Edge)
                                                      v
+----------------------------------------------------------------------------------------------------+
|                                  CDN Storage / Master Manifest (.m3u8)                             |
|                                                                                                    |
|  - Stream Variant 1: 1080p (4.5 Mbps Bitrate) ---> /1080p/chunk_004.m4s                            |
|  - Stream Variant 2: 720p  (2.2 Mbps Bitrate) ---> /720p/chunk_004.m4s                             |
|  - Stream Variant 3: 480p  (800 Kbps Bitrate) ---> /480p/chunk_004.m4s                             |
+----------------------------------------------------------------------------------------------------+
                                                      |
              (Network Drop Detected: Bandwidth drops from 5 Mbps to 1 Mbps)
                                                      v
+----------------------------------------------------------------------------------------------------+
|  Player dynamic switch: Next request automatically drops to 480p Segment (chunk_005_480p.m4s)     |
|  Result: Playback continues seamlessly without buffering stall!                                   |
+----------------------------------------------------------------------------------------------------+
```

### Video Encoding Ladder Example Matrix

| Profile Resolution | Target Bitrate | Frame Rate | Video Codec | Recommended Audio Bitrate | Target Connection |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1080p (Full HD)** | 4,500 Kbps | 60 fps | H.264 / HEVC | 192 Kbps AAC | High-Speed Fiber / 5G |
| **720p (HD)** | 2,200 Kbps | 30 fps | H.264 | 128 Kbps AAC | Standard Home Broadband / 4G |
| **480p (SD)** | 800 Kbps | 30 fps | H.264 | 96 Kbps AAC | Mobile 3G / Congested Wi-Fi |
| **360p (Low)** | 400 Kbps | 30 fps | H.264 | 64 Kbps AAC | Edge Mobile Connections |

### ABR Switching Algorithms

- **Throughput-Based Algorithms**: Calculate moving average download speed of previous N segments. If estimated throughput exceeds target bitrate by 20%, upgrade resolution.
- **Buffer-Based Algorithms (BBA)**: Ignore network throughput estimates entirely; switch resolutions based strictly on current video buffer level in RAM (e.g. < 5s buffer = drop quality, > 20s buffer = increase quality).
- **Hybrid Algorithms (BOLA / MPC)**: Combine throughput predictions and buffer health optimization to prevent rapid quality oscillations.

### Key Trade-offs & Production Goals

- ✅ **Eliminates Playback Buffering Stalls**: Drastically reduces user abandonment caused by buffering spinners.
- ✅ **Optimized Experience**: Delivers highest possible resolution for available network conditions.
- ❌ **Transcoding Complexity**: Generating 4 to 8 resolution variants per video increases initial encoding cost and cloud storage footprint.

### Key takeaway

Adaptive Bitrate Streaming prevents video buffering stalls by **dynamically switching between different quality segment streams** based on real-time client bandwidth and buffer measurements.
