# Design File Upload Service
> **Category:** Beginner System Design Problems

---

### Overview
A **File Upload Service** handles the ingestion, validation, chunking, and persistent storage of large user files (videos, documents, archives) up to multiple gigabytes in size.

To prevent backend application servers from becoming network bottlenecks, modern file upload architectures bypass application servers during payload transfer using **S3 Presigned URLs** and **Multipart Chunk Uploads**.

### Multipart Upload & Presigned URL Architecture

```
CLIENT (Browser/App)                               API SERVICE                          AWS S3 OBJECT STORAGE
  |                                                     |                                          |
  | 1. POST /upload/init (filename, filesize)           |                                          |
  | --------------------------------------------------> |                                          |
  |                                                     | 2. Request Presigned Upload URLs         |
  |                                                     |    (Generate Part Upload Signed URLs)    |
  | 3. Return UploadID + List of Presigned Part URLs    |                                          |
  | <-------------------------------------------------- |                                          |
  |                                                     |                                          |
  | 4. PUT /part-1 (Chunk 1 - 5MB Payload)              |                                          |
  | ----------------------------------------------------------------------------------------------> |
  | 5. PUT /part-2 (Chunk 2 - 5MB Payload)              |                                          |
  | ----------------------------------------------------------------------------------------------> |
  |                                                                                                |
  | 6. POST /upload/complete (UploadID, ETags List)     |                                          |
  | --------------------------------------------------> |                                          |
  |                                                     | 7. Assemble Multipart Chunks             |
  |                                                     | ---------------------------------------> |
  | 8. HTTP 200 OK (File Upload Completed)              |                                          |
  | <-------------------------------------------------- |                                          |
```

### Key Technical Mechanics
1. **Direct-to-S3 Presigned URLs:** Client requests temporary cryptographic signed URLs from the API service. Upload data flows directly from client to S3, keeping API servers free of heavy binary network traffic.
2. **Multipart Chunk Upload Protocol:** Splits files > 100 MB into 5 MB - 20 MB chunks uploaded in parallel. Failed chunks are retried independently without re-uploading the entire file.
3. **ETag Verification:** S3 returns an MD5 hash (ETag) for each uploaded chunk. The client sends all ETags upon completion to verify chunk integrity before final assembly.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/upload/init` | POST | `{"filename": "video.mp4", "filesize": 524288000, "chunk_size": 10485760}` | `{"upload_id": "up_8821", "part_urls": ["https://s3.amazonaws.com/part1?signature=...", "..."]}` |
| `/api/v1/upload/complete`| POST | `{"upload_id": "up_8821", "parts": [{"part_number": 1, "etag": "e123"}, ...]}` | `{"file_id": "f_9920", "s3_url": "https://bucket.s3.amazonaws.com/video.mp4"}` |
| `/api/v1/upload/abort` | POST | `{"upload_id": "up_8821"}` | `{"status": "ABORTED", "message": "Uploaded chunks purged"}` |

### File Metadata Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `file_id` | String (UUID) | PostgreSQL / DynamoDB | Primary Key for file metadata record. |
| `user_id` | String | Relational DB | Owner account ID uploading the file. |
| `s3_key` | String | Relational DB | Path in S3 bucket (`uploads/users/u99/video.mp4`). |
| `file_size` | BigInt | Relational DB | Total size in bytes. |
| `upload_status` | Enum | Relational DB | Status (`INITIATED`, `UPLOADING`, `COMPLETED`, `FAILED`). |
| `checksum_sha256` | String | Relational DB | Cryptographic SHA-256 hash verifying end-to-end file integrity. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Direct S3 Presigned Uploads** | Eliminates application server CPU/bandwidth bottleneck; scales infinitely. | Harder to execute real-time payload virus scanning during active upload transfer. | Large file upload services (video, raw dataset uploads). |
| **Multipart Parallel Uploads** | High resilience against network failures; resumes failed uploads from exact failed chunk. | Requires state management tracking active `upload_id` and chunk ETags. | Uploading files larger than 100 MB over unstable mobile/Wi-Fi networks. |
| **Proxied Upload via API Servers**| Easy to execute immediate streaming virus scanning and format validation. | Application servers get locked with open connection sockets; scales poorly. | Small file uploads (< 5 MB images or text documents). |

### Key takeaway
A **File Upload Service** scales by using **Direct-to-S3 Presigned URLs** to bypass backend application servers and **Multipart Chunk Uploads** to enable parallel, resumable chunk transfers for files larger than 100 MB.
