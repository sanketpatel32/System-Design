# Video Transcoding Pipeline

> **Category:** Storage Systems

---

A video transcoding pipeline converts uploaded videos into **multiple formats and
resolutions** for adaptive streaming across devices.

### Why
- Different devices need different formats (HLS for iOS, DASH for web/Android).
- Bandwidth varies → multiple resolutions.
- Compression reduces storage + bandwidth.
- DRM / watermarking for protection.

### Stages
```
1. Ingest       : receive raw upload (multipart to S3).
2. Trigger      : S3 event -> queue -> transcoder worker.
3. Analyze      : probe video (codec, duration, resolution).
4. Transcode    : FFmpeg to multiple resolutions:
                  - 240p (H.264, low bitrate)
                  - 480p
                  - 720p
                  - 1080p
                  - 4K (if source supports)
5. Package      : HLS segments + playlists (.m3u8).
6. Store        : output to S3 processed bucket.
7. Notify       : publish "video ready" event.
8. Distribute   : CDN caches the output.
```

### Architecture
```
[S3 raw] -> [SQS/SNS] -> [Transcoder workers (auto-scaled)]
                                |
                                v
                          [FFmpeg processing]
                                |
                                v
                          [S3 processed + HLS]
                                |
                                v
                          [CDN] -> viewers
```

### Worker scaling
- Transcoding is CPU/GPU-heavy.
- Autoscale workers on queue depth.
- Each worker processes one job at a time.

### FFmpeg basics
```bash
ffmpeg -i input.mp4 \
  -map 0:v -map 0:a \
  -s:v:0 1920x1080 -b:v:0 5000k \
  -s:v:1 1280x720  -b:v:1 2500k \
  -s:v:2 854x480   -b:v:2 1000k \
  -f hls \
  -hls_playlist_type vod \
  -hls_segment_filename "v%v/segment_%03d.ts" \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
  out.m3u8
```

### Failure handling
- Transcoder crash → retry, DLQ.
- Bad input → mark failed, notify user.
- Partial output → cleanup, retry.

### Optimizations
- **GPU acceleration** (NVENC) — 5-10x faster.
- **Two-pass encoding** — better quality at same bitrate.
- **Per-title encoding** — adapt to content complexity.
- **Scene-based segmentation** — better seeking.

### Key takeaway
A transcoding pipeline = **queue + auto-scaled FFmpeg workers + HLS output to S3 + CDN**. Use
GPU for speed, multi-resolution for adaptive streaming, queue + DLQ for reliability.
