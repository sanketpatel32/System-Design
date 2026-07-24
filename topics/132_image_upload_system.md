# Image Upload System

> **Category:** Storage Systems

---

An Image Upload System ingests image files from clients, validates and optimizes them asynchronously, stores original and processed variants in object storage, and serves them via CDN.

### System Architecture

```
+--------+       1. Request Signed URL       +--------------------+       2. Write Metadata       +---------------+
| Client | --------------------------------> | API Gateway / App  | ----------------------------> | Metadata DB   |
+--------+                                   +--------------------+                               +---------------+
    |                                                  |
    | 3. Direct Upload (PUT)                           v 4. Push Processing Event
    v                                        +--------------------+
+------------------------------------+       | Message Queue      |
| S3 Raw Storage Bucket (Original)   |       | (Kafka / SQS)      |
+------------------------------------+       +--------------------+
    |                                                  |
    | Event Notification                               v
    +------------------------------------->  +--------------------+       Store Optimized   +---------------+
                                             | Image Workers      | ----------------------> | S3 Web Bucket |
                                             | (Resize, WebP, Watermark)                   +---------------+
                                             +--------------------+                                |
                                                                                                   v
                                                                                           +---------------+
                                                                                           | CDN Edge Node |
                                                                                           +---------------+
```

### Async Processing Pipeline Steps

1. **Pre-signed Direct Upload**: Client requests upload URL. Server validates user quota and issues presigned S3 URL. Data bypasses web app servers.
2. **Virus & Malware Scanning**: Lambda / Worker container scans uploaded file buffer before trigger downstream tasks.
3. **Thumbnail & Format Generation**: Asynchronously generates multiple resolutions (1080p, 720p, 480p, thumbnail) and converts formats (JPEG/PNG to WebP/AVIF).
4. **Metadata & CDN Registration**: Image metadata (dimensions, EXIF scrubbed data, hash digest, image URLs) is indexed in DB and cached at CDN edges.

### Image Optimization Matrix

| Variant / Format | Compression / Codec | Target Resolution | Relative Size | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Original Raw** | Uncompressed / PNG | Source | 100% | Archival / Download |
| **Web Display** | WebP (Quality 80) | 1920x1080 | ~25-30% | Desktop Web Banners |
| **Mobile Display** | AVIF / WebP | 720x1280 | ~15-20% | Mobile Feed Items |
| **Thumbnail** | WebP | 150x150 | ~3-5% | User Avatars / Grid Preview |

### Reliability & Resilience Strategies

- **Deduplication**: Generate SHA-256 hash of raw image payload; skip re-encoding if hash exists in object storage.
- **Circuit Breaking**: Fall back to serving un-optimized originals directly from S3 if processing worker queue backs up.

### Key takeaway

Design image upload systems using **presigned URLs for direct object store ingest** combined with **asynchronous worker queues** for image transformation and CDN distribution.
