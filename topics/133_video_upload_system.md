# Video Upload System

> **Category:** Storage Systems

---

Design a system for users to upload and stream videos.

### Requirements
- Functional: upload large videos, stream them adaptively.
- Non-functional: high throughput upload, low-latency global playback, durability.

### Architecture
```
[Client] -multipart-> [S3 (raw)] -trigger-> [Transcoder pipeline]
                                              |
                                              v
                                    [Multiple resolutions + HLS segments]
                                              |
                                              v
                                    [S3 (processed)]
                                              |
                                              v
[Client] -stream-> [CDN] -origin-> [S3 (processed)]
```

### Upload flow
1. Client requests upload URL.
2. App generates **multipart upload** pre-signed URLs.
3. Client uploads parts in parallel, resumes on failure.
4. App completes multipart upload.
5. S3 event triggers transcoder.

### Transcoding pipeline
- Input: raw video (any format, any size).
- Output: multiple resolutions (240p, 480p, 720p, 1080p, 4K) in HLS/DASH format.
- HLS splits video into segments (e.g. 10-second chunks).
- Each resolution has a playlist (`master.m3u8`).

### Adaptive streaming
- Client requests `master.m3u8`.
- Picks resolution based on bandwidth.
- Switches seamlessly mid-playback as bandwidth changes.
- CDN caches segments at the edge.

### Key components
- **S3** for raw + processed storage.
- **Transcoder** (MediaConvert, FFmpeg on Fargate).
- **CDN** for streaming segments.
- **Metadata DB** for video info.
- **CDN** for thumbnails and previews.

### Optimizations
- **Multipart upload** for large files (5GB+).
- **Pre-warm CDN** for popular videos.
- **DRM** (Widevine, FairPlay) for paid content.
- **Live streaming** variant (RTMP ingest, real-time transcode).

### Storage tiering
- Hot: recently uploaded videos → S3 Standard.
- Warm: 30 days old → S3 IA.
- Cold: 1 year old → Glacier.

### Key takeaway
Video upload = **multipart → S3 → transcoder → HLS segments → CDN**. Use adaptive bitrate
streaming (HLS/DASH) for variable-bandwidth clients. CDN caches segments for global low-latency
playback.
