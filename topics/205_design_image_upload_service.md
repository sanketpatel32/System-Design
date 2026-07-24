# Design Image Upload Service
> **Category:** Beginner System Design Problems

---

### Overview
An **Image Upload Service** processes, optimizes, resizes, and serves image assets across varying screen resolutions and modern compression formats (WebP/AVIF) with low latency via global Content Delivery Networks (CDNs).

### System Architecture Topology

```
+--------+     1. Direct S3 Upload (Presigned URL)     +-------------------+
| Client | -------------------------------------------> | Raw S3 Bucket     |
+--------+                                              +-------------------+
    ^                                                             |
    |                                                             | 2. S3 Event Trigger (ObjectCreated)
    |                                                             v
    |                                                   +-------------------+
    |                                                   | Async Image Worker|
    |                                                   | (AWS Lambda/Fargate)|
    |                                                   +-------------------+
    |                                                             |
    |                                                             v 3. Process & Write Variants
    |                                                   +-------------------+
    | <--- 5. Low-latency Image Fetch ----------------- | Processed CDN S3  |
    |      (CloudFront / Fastly CDN)                    +-------------------+
```

### Processing Pipeline Specification

| Step | Operations Performed | Output Asset |
|---|---|---|
| **1. Validation & Strip** | Validate MIME type header & magic bytes; strip EXIF location metadata for privacy. | Clean Master Image |
| **2. Compression** | Re-encode raw JPEG/PNG using modern codecs (**WebP / AVIF**). | ~60% size reduction |
| **3. Multi-resolution Scaling**| Generate resolution variants: Thumb (150x150), Medium (800x800), Large (1920x1080). | Resolution Set |
| **4. CDN Storage** | Save processed image variants in S3 bucket linked to CloudFront CDN. | Immutable CDN URL |

### Image Metadata Schema (PostgreSQL)
```json
{
  "image_id": "img_9981a2",
  "user_id": "usr_441",
  "original_name": "vacation.png",
  "mime_type": "image/webp",
  "exif_stripped": true,
  "variants": {
    "thumb": "https://cdn.example.com/img_9981a2_thumb.webp",
    "medium": "https://cdn.example.com/img_9981a2_med.webp",
    "large": "https://cdn.example.com/img_9981a2_large.webp"
  },
  "created_at": 1700000000
}
```

### Key takeaway
Offload heavy CPU image transformation tasks (resizing, WebP encoding) to **asynchronous event-driven workers** triggered by object storage uploads. Serve all processed image variants through a **Global CDN**.
