# Design File Upload Service
> **Category:** Beginner System Design Problems

---

### Overview
A **File Upload Service** handles secure, reliable, and scalable uploads of generic files (documents, archives, videos) supporting large files via chunked multipart uploads, pre-signed URLs, and asynchronous processing.

### Upload Workflows: Pre-Signed URL vs Direct Server Streaming

```
Pre-Signed URL Pattern (Recommended):
Client                      API Gateway                 Metadata DB                S3 Object Storage
  |                              |                           |                             |
  | --- 1. Request Upload URL -> |                           |                             |
  |                              | --- 2. Generate Presigned |                             |
  | <--- 3. Return Presigned URL-|                           |                             |
  |                                                                                        |
  | ==================== 4. Direct Upload (PUT Payload) =================================> |
  |                                                                                        |
  | --- 5. Upload Complete ----> |                           |                             |
  |                              | --- 6. Save File Metadata->|                             |
```

### Core API Interface

| Endpoint | Method | Request Payload | Response |
|---|---|---|---|
| `/api/v1/files/presign` | `POST` | `{"file_name": "doc.pdf", "file_size": 5242880, "mime_type": "application/pdf"}` | `200 OK` -> `{"upload_url": "https://s3...", "file_id": "f_123"}` |
| `/api/v1/files/multipart/init`| `POST` | `{"file_name": "video.mp4", "total_parts": 10}` | `200 OK` -> `{"upload_id": "u_998", "parts": [...]}` |

### Large File Handling: Resumable Multipart Uploads

| Part Upload Step | Mechanism |
|---|---|
| **1. Init Multipart** | S3 issues an `UploadId`. Client splits file into 5 MB - 5 GB chunks. |
| **2. Parallel Part Upload** | Client uploads chunks concurrently directly to S3 using pre-signed part URLs. |
| **3. ETags Verification** | S3 returns an `ETag` checksum per completed chunk. |
| **4. Complete Multipart** | Client submits list of all part numbers and `ETags` to assemble the complete file. |

### Key takeaway
Avoid streaming file byte streams through application servers. Use **Pre-Signed URLs** to allow clients to upload directly to object storage (**S3**), and use **Multipart Uploads** for large files.
