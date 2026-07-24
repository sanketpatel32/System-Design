# Image Upload System

> **Category:** Storage Systems

---

An image upload system ingests, processes, optimizes, and stores user-uploaded images at scale. It handles direct storage upload delegation, asynchronous thumbnail generation, image format compression (WebP/AVIF), and CDN content distribution.

### System Architecture & Async Processing Flow

The system uses Presigned URLs for direct ingestion into object storage, triggering asynchronous processing workers via event notifications.

```
+---------------+     1. Request Presigned Upload URL     +-------------------+
| Client App    | --------------------------------------> | API Backend       |
|               | <-------------------------------------- | (Generates Token) |
+---------------+       2. Return Presigned URL           +-------------------+
        |
        | 3. Direct Upload Raw Image (PUT)
        v
+-----------------------+     4. S3 ObjectCreated Event    +-------------------+     5. Read Raw / Resize    +-------------------+
| Object Storage (S3)   | -------------------------------> | Message Queue     | --------------------------> | Image Processing  |
| - /raw/original.jpg   |                                  | (Kafka / SQS)     |                             | Workers           |
+-----------------------+                                  +-------------------+                             +-------------------+
        ^                                                                                                              |
        |                                       6. Save Optimized WebP Variants                                        |
        +--------------------------------------------------------------------------------------------------------------+
                                                - /thumbs/thumb.webp
                                                - /optimized/display.webp
```

### Data Model & Image Metadata Schema

```sql
CREATE TABLE user_images (
    image_id        UUID PRIMARY KEY,
    user_id         UUID NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width_px        INT NOT NULL,
    height_px       INT NOT NULL,
    s3_raw_path     VARCHAR(512) NOT NULL,
    s3_webp_path    VARCHAR(512) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'PROCESSING',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_images ON user_images(user_id, status);
```

### Format Optimization & Size Comparison Matrix

| Format | Compression Type | Browser Compatibility | Avg Relative Size | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **JPEG** | Lossy | 100% (Universal) | 100% (Baseline) | Legacy photo display |
| **PNG** | Lossless | 100% (Universal) | 150%-200% | Transparency, icons, graphics |
| **WebP** | Lossy / Lossless | ~97% Modern Browsers | 60%-70% | Standard web display images |
| **AVIF** | Lossy / Lossless | ~90% Modern Browsers | 40%-50% | High-efficiency next-gen image delivery |

### Key System Considerations & Safeguards

1. **Magic Bytes Validation**: Inspect binary header bytes (e.g. `0xFF 0xD8 0xFF` for JPEG) instead of trusting user file extensions to prevent malicious executable execution.
2. **Asynchronous Image Resizing**: Perform heavy image scaling and WebP conversion asynchronously off worker threads to maintain fast API response times.
3. **CDN Caching**: Edge servers cache resized variants using `Cache-Control: public, max-age=31536000, immutable`.

### Key takeaway

An image upload system must **decouple upload ingestion from async processing**, leveraging presigned storage URLs, event-driven queues, and modern image formats (WebP/AVIF) served via CDNs.
