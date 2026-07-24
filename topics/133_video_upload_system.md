# Video Upload System

> **Category:** Storage Systems

---

A video upload system ingests multi-gigabyte video files, validates video containers and codecs, splits source files into manageable chunks, and dispatches them to transcoding pipelines while maintaining progress tracking for clients.

### High-Scale Video Ingestion Architecture

Large video files are ingested using chunked multipart uploads, recording chunk completion in a metadata storage service to survive mobile dropouts.

```
+------------------+       1. Request Multipart Upload ID       +------------------------+
| Client Mobile    | -----------------------------------------> | Video API Gateway      |
| App / Web        | <----------------------------------------- | (Generates Session ID) |
+------------------+         2. Return Upload ID & Parts        +------------------------+
        |
        | 3. Upload Concurrent Chunks (5MB-50MB each) directly to S3
        v
+------------------------------------------------------------------------------------------------+
| Cloud Object Storage (S3 / Blob)                                                               |
|  - Part 1: /uploads/{upload_id}/part1.ts                                                      |
|  - Part 2: /uploads/{upload_id}/part2.ts                                                      |
+------------------------------------------------------------------------------------------------+
        |
        | 4. Complete Upload Trigger -> S3 Event EventBridge
        v
+------------------------------------------------------------------------------------------------+
| Video Validation & Transcoding Queue                                                            |
|  - Validates Container (MP4, MOV, MKV) & Codec (H.264, HEVC, AV1)                              |
|  - Enqueues jobs for Distributed Transcoding Farm                                              |
+------------------------------------------------------------------------------------------------+
```

### Video Ingestion API Endpoint Matrix

| Action | HTTP Endpoint | Description | Payload Data |
| :--- | :--- | :--- | :--- |
| **Initialize Upload** | `POST /api/v1/videos/upload/initiate` | Registers metadata and allocates multipart session | `{ title, file_size, duration, filename }` |
| **Get Part Presigned URL**| `GET /api/v1/videos/upload/presign-part` | Fetches signed URL for specific chunk number | `upload_id, part_number` |
| **Complete Upload** | `POST /api/v1/videos/upload/complete` | Triggers part assembly and initiates transcoding | `upload_id, parts: [{ part_num, etag }]` |
| **Upload Status** | `GET /api/v1/videos/{video_id}/status` | Polls encoding progress percentage | None |

### Ingestion Resiliency & Failure Recovery

- **Resume Capability**: If a connection drops halfway through a 5GB video upload, the client queries the API for missing `part_number` IDs and uploads only the missing parts.
- **Client-Side File Chunking**: HTML5 `File.slice()` or mobile SDK native stream chunkers split large video payloads locally in client RAM.
- **Checksum Verification**: Clients compute MD5/SHA256 hashes per part to prevent video chunk corruption during transfer.

### Trade-offs & Production Risks

- ✅ **Resilience Against Network Drops**: Uploading in discrete chunks prevents full file re-uploads.
- ✅ **Scalability**: Decouples API servers from heavy streaming I/O via direct object storage presigned URLs.
- ❌ **High Storage Overhead**: Raw uncompressed source videos require temporary holding storage until transcoding completes.
### Resumable Upload Architecture & API Protocol

```
+----------------+      1. Query Existing Parts (`GET /upload/status?uploadId=XYZ`)     +----------------------+
| Client Mobile  | -------------------------------------------------------------------> | Metadata DB / S3 API |
| App            | <------------------------------------------------------------------- | (Returns Parts 1,2)  |
+----------------+      2. Received Completed Part List: [Part 1: OK, Part 2: OK]       +----------------------+
        |
        | 3. Resume Uploading ONLY Remaining Part 3 & Part 4!
        v
+------------------------------------------------------------------------------------------------------+
| Upload Part 3 (50MB) -> Direct S3 PUT -> Success!                                                    |
| Upload Part 4 (50MB) -> Direct S3 PUT -> Success!                                                    |
+------------------------------------------------------------------------------------------------------+
```

### Production Edge Cases & Failure Mitigation

1. **Client Cellular Data Dropouts**: Mobile devices switching from Wi-Fi to 4G break ongoing TCP sockets. The client app catches network exceptions, queries uploaded parts via `ListParts`, and resumes from the first missing chunk.
2. **Stale Incomplete Upload Cleanup**: Clients that abandon uploads mid-way leave un-assembled chunks occupying S3 storage. Buckets must configure S3 Lifecycle Rules with `AbortIncompleteMultipartUpload` set to 7 days.

### Key takeaway

A robust video upload system relies on **client-side chunking, presigned multipart uploads, and resumable state tracking** to ingest multi-gigabyte files reliably over volatile connections.
