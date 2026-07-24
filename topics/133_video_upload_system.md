# Video Upload System

> **Category:** Storage Systems

---

A Video Upload System handles multi-gigabyte video files, providing **resumable chunked ingestion**, virus scanning, initial file integrity validation, and event dispatching to transcoding pipelines.

### Resumable Upload Architecture

```
+--------+           1. Initiate Session (POST /upload/init)          +-----------------------+
| Client | ---------------------------------------------------------> | Video Service API     |
+--------+                                                            +-----------------------+
    |                                                                             |
    |<----------------------------------------------------------------------------+
    |           2. Return Upload ID & Chunk Session Tokens
    |
    | 3. Upload Chunks via Parallel HTTP PUTs (Part 1..N)
    +---------------------------------------------------------------> +-----------------------+
    |                                                                 | Temp S3 Upload Bucket |
    |<----------------------------------------------------------------+-----------------------+
    |           4. ACK Part ETags                                                 |
    |                                                                             v 5. Complete Event
    | 6. Complete Session (POST /upload/complete)                     +-----------------------+
    +---------------------------------------------------------------> | Transcode Kafka Topic |
                                                                      +-----------------------+
```

### Video Ingestion Pipeline Components

1. **Upload Session Initiator**: Creates upload ticket in DB storing expected file checksum, size, and metadata.
2. **Chunk Manager**: Receives 5MB-50MB chunks. Tracks received byte ranges in Redis (`SETBIT` or set array).
3. **Assembly & Validation**: Validates video file header (mp4 atom / container format) to prevent invalid file formats.

### API Endpoints for Video Ingest

| Endpoint | Method | Request Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/videos/upload/init` | `POST` | `{title, size, checksum}` | Initiates session, returns `upload_id`. |
| `/api/v1/videos/upload/part` | `PUT` | Binary chunk + `upload_id` + `part_no` | Uploads single chunk (5MB-50MB). |
| `/api/v1/videos/upload/status`| `GET` | `?upload_id=XYZ` | Query missing chunk ranges for resume. |
| `/api/v1/videos/upload/complete`| `POST`| `{upload_id, etags[]}` | Finalizes and triggers transcoding queue. |

### Edge Case Management

- **Network Drops Mid-Upload**: Client queries `/upload/status` to fetch missing chunk indexes and resumes uploading only failed chunks.
- **Storage Cleanup**: Incomplete video uploads trigger S3 lifecycle abort rules after 24–48 hours to prevent storage leak costs.

### Key takeaway

Scale video upload systems by adopting **resumable chunked uploads over presigned URLs** with explicit Redis state tracking, decoupling upload ingestion from transcoding execution.
