# Design YouTube

> **Category:** Intermediate System Design Problems

---

Design YouTube: upload, transcode, stream, search, recommend.

### Requirements
- **Functional**: upload videos; adaptive streaming; search; recommendations; comments.
- **Non-functional**: massive bandwidth; low-latency global playback.

### Architecture
```
[Uploader] -multipart-> [S3 raw] -trigger-> [Transcoder] -> [HLS variants]
                                                            |
[Viewer] -> [CDN] <-origin- [S3 processed]
```

### Upload
- Multipart (large files).
- Pre-signed URLs (offload from app).

### Transcoding
- Multiple resolutions (240p to 4K).
- HLS segments + playlists.
- GPU acceleration.

### Streaming
- **Adaptive bitrate**: client picks quality.
- **CDN caches segments** globally.

### Search
- Elasticsearch on video metadata + transcripts.

### Recommendations
- Collaborative filtering + content-based + deep learning.
- Trained on watch history, likes, similar users.

### Data model
```
videos (id, user_id, title, description, duration, view_count)
video_variants (video_id, resolution, hls_url)
comments (video_id, user_id, text)
```

### Key takeaway
YouTube = multipart upload → S3 → transcoder → HLS → CDN → adaptive streaming player.
Recommendations via ML. Bandwidth dominates cost — CDN + compression are mandatory.
