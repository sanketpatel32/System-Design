# Image Upload System

> **Category:** Storage Systems

---

Design a system for users to upload, store, and serve images.

### Requirements
- Functional: upload, view, delete images.
- Non-functional: low-latency reads globally, durability, handle large files.

### Architecture
```
[Client] -> [API Gateway] -> [Upload Service]
                                  |
                                  v
                            Generate pre-signed URL
                                  |
                                  v
[Client] -direct upload-> [S3 bucket]
                              |
                              | S3 event
                              v
                          [Lambda]
                              |
                              v
                       [Image processor]
                       (resize, thumbnails, EXIF strip)
                              |
                              v
                       [S3 (original + derived)]
                              |
                              v
                       [Metadata DB]
                       (id, user_id, sizes, urls, tags)

[Client] -read-> [CDN] -origin-> [S3]
```

### Upload flow
1. Client requests upload URL from API.
2. App authenticates, generates pre-signed URL.
3. Client uploads directly to S3.
4. S3 event triggers Lambda.
5. Lambda creates thumbnails (e.g. 100x100, 500x500), writes back to S3.
6. Lambda inserts metadata in DB.

### Read flow
1. Client requests image (e.g. `/img/abc_500x500.jpg`).
2. CDN serves from edge (cache hit) or origin S3 (cache miss).
3. Subsequent reads are cache hits — fast.

### Key components
- **S3** for object storage (original + variants).
- **CDN** (CloudFront) for global low-latency reads.
- **Metadata DB** (Postgres / DynamoDB) for searchable info.
- **Image processor** (Lambda / Fargate) for thumbnails, format conversion.
- **Pre-signed URLs** for direct upload.

### Optimizations
- **WebP/AVIF** conversion (30-50% smaller).
- **Adaptive thumbnails** (responsive images).
- **Lazy EXIF stripping** (privacy).
- **Virus scan** on upload.
- **Watermarking** for premium content.

### Key takeaway
Image upload = **client → pre-signed URL → S3 → async processor → CDN**. Offload upload
bandwidth via pre-signed URLs; offload read bandwidth via CDN; store metadata in a DB for
queries.
