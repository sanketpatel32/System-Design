# Design Image Upload Service
> **Category:** Beginner System Design Problems

---

### Overview
An **Image Upload Service** processes, optimizes, transforms, and stores user-uploaded images (profile avatars, product photos, social media posts). Unlike generic file upload services, image services require asynchronous image processing pipelines (resizing, crop generation, EXIF metadata stripping, WebP/AVIF format conversion, and watermark injection) paired with global CDN edge caching.

System objectives focus on fast client response times, low storage footprint via modern image compression codecs, and sub-50ms image delivery worldwide.

### Image Processing Pipeline & System Topology

```
+------------------+     1. Direct Presigned Upload     +--------------------+
| Client App       | ---------------------------------> | S3 Raw Image Bucket|
+------------------+                                    +--------------------+
         |                                                         |
         | 2. POST /api/v1/images/process                          | 3. S3 Event Notification
         v                                                         v
+------------------+                                    +--------------------+
| API Gateway      |                                    | Kafka Image Event  |
+------------------+                                    | Ingestion Queue    |
                                                        +--------------------+
                                                                   |
                                                                   v 4. Consume Task
                                                        +--------------------+
                                                        + Image Processing   |
                                                        | Workers (Sharp/FF) |
                                                        +--------------------+
                                                                   |
                                                                   v 5. Save Processed WebP Variants
                                                        +--------------------+
                                                        | S3 CDN Bucket      |
                                                        | (CloudFront CDN)   |
                                                        +--------------------+
```

### Key Technical Mechanics
1. **Asynchronous Worker Queue:** Raw images uploaded directly to S3 emit an event to a Kafka/RabbitMQ topic. Background processing workers generate resized variants (`thumbnail`, `mobile`, `desktop`) asynchronously without blocking client upload threads.
2. **Modern Image Compression Codecs:** Converts raw JPEG/PNG images into **WebP** and **AVIF** formats, reducing file size by 30% - 50% while preserving visual quality.
3. **EXIF Stripping:** Automatically removes GPS coordinates, camera model metadata, and timestamp tags from raw images to safeguard user location privacy.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/images/upload-url`| POST | `{"filename": "photo.jpg", "content_type": "image/jpeg", "size": 4194304}` | `{"image_id": "img_881", "upload_url": "https://s3.amazonaws.com/raw/photo.jpg?sig=..."}` |
| `/api/v1/images/{id}` | GET | None | `{"image_id": "img_881", "urls": {"original": "...", "webp_large": "...", "thumbnail": "..."}}` |
| `/api/v1/images/{id}/crop` | POST | `{"crop_box": {"x": 10, "y": 10, "w": 200, "h": 200}}` | `{"status": "PROCESSING", "task_id": "task_991"}` |

### Image Metadata Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `image_id` | String (UUID) | PostgreSQL / DynamoDB | Primary Key for image record. |
| `owner_user_id` | String | Relational DB | User account owner ID. |
| `raw_s3_key` | String | Relational DB | Original uncompressed raw S3 key. |
| `variants_json` | JSONB | Relational DB | Map of generated variants: `{"thumb": "s3://...", "webp": "s3://..."}`. |
| `dimensions` | JSONB | Relational DB | Dimensions payload `{"width": 1920, "height": 1080}`. |
| `checksum_sha256` | String (Indexed) | Relational DB | Deduplication hash to prevent duplicate storage of identical images. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Asynchronous Processing Queue** | Fast client upload response times; isolates backend workers from processing spikes. | Client experiences slight delay before processed thumbnails appear in UI. | Standard social media and e-commerce image uploads. |
| **On-the-Fly Dynamic Resizing** | Zero pre-computed storage costs; images resized dynamically on CDN edge request. | High CPU spike overhead on CDN cache miss for first-time image requests. | Platforms with millions of potential dynamic image resolution variations. |
| **WebP / AVIF Format Conversion**| Reduces S3 storage and CDN egress bandwidth costs by 30% - 50%. | CPU rendering overhead during conversion; legacy browsers require JPEG fallback. | High-traffic public web and mobile platforms. |

### Key takeaway
An **Image Upload Service** uses an **Asynchronous Event Worker Queue** (Kafka + Sharp workers) to process raw uploads into optimized **WebP/AVIF** variants without blocking client upload threads, serving final assets via edge CDNs.
