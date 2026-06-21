# Design Image Upload Service

> **Category:** Beginner System Design Problems

---

See **#132 Image Upload System** for full design.

### Summary
- Client → pre-signed URL → S3 → Lambda (thumbnails) → metadata DB → CDN.

### Key components
- **S3**: original + derived images.
- **Lambda / Fargate**: resize, format conversion (WebP).
- **Postgres**: metadata.
- **CDN**: global low-latency reads.

### Variants
- **Multi-size**: thumbnail, medium, large.
- **Format**: WebP/AVIF for modern browsers.
- **EXIF stripping** for privacy.

### Key takeaway
Image upload = pre-signed URL → S3 → async processor → CDN. Offload bandwidth via pre-signed
URLs, generate thumbnails via async workers.
