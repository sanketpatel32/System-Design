# Design File Upload Service

> **Category:** Beginner System Design Problems

---

Design a service to upload, store, and download files (any type).

### Requirements
- **Functional**: upload, download, list, delete; up to 1GB files.
- **Non-functional**: low-latency reads; durable; resumable uploads.

### Architecture
```
[Client] -> [API] -> generate pre-signed URL
              |
              v
[Client] -> direct upload -> [S3]
                              |
                              v (event)
                          [Metadata DB]
```

### Upload flow
1. Client requests upload URL.
2. App authenticates + generates pre-signed URL.
3. Client uploads directly to S3.
4. S3 event triggers metadata save.

### Multipart upload
- For files > 100MB.
- Parallel parts, resume on failure.
- 5TB max.

### Data model
```
files:
  file_id (PK)
  user_id
  s3_key
  size
  mime_type
  created_at
```

### Resumable uploads
- S3 multipart: pause/resume per part.
- Client tracks part ETags.

### Key takeaway
File upload = pre-signed URLs (offload bandwidth from app) + S3 + metadata DB. Use multipart
for large files. App does auth, generates URL; S3 does the bytes.
