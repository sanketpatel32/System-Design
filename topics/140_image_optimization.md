# Image Optimization

> **Category:** CDN and Media Delivery

---

Image Optimization reduces image payload sizes, converts legacy formats to modern codecs, and dynamically resizes imagery based on user device viewports to accelerate web page loading speeds.

### Dynamic Image Optimization Pipeline

```
+--------+        1. HTTP GET /img.jpg?w=400&format=webp        +---------------+
| Client | ---------------------------------------------------> | Edge CDN PoP  |
+--------+                                                      +---------------+
    ^                                                                   |
    | 4. Cache Hit (Optimized WebP Image)                               v 2. Cache Miss
    +---------------------------------------------------------- +-----------------------+
                                                                | Image Processing Edge |
                                                                | (Resizes & Converts)  |
                                                                +-----------------------+
                                                                            | 3. Fetch Original
                                                                            v
                                                                +-----------------------+
                                                                | Original S3 Bucket    |
                                                                +-----------------------+
```

### Image Codec & Format Matrix

| Format | Compression Type | Transparency | Animation | Size vs JPEG | Best Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JPEG** | Lossy | No | No | Baseline (100%) | Legacy Fallback Photographs |
| **PNG** | Lossless | Yes | No | 150 - 200% | Vector Icons, Screenshots, Text |
| **WebP** | Lossy / Lossless | Yes | Yes | ~65 - 75% | Modern Web & Mobile Images |
| **AVIF** | Lossy / Lossless | Yes | Yes | ~50 - 60% | Ultra-High Quality Compressed Media |

### Key Optimization Rules

- **Responsive Images (`srcset`)**: Provide `srcset` hints allowing browser viewports to request exact resolution dimensions (e.g., 320w, 640w, 1024w).
- **EXIF Metadata Stripping**: Remove camera model, geolocation, and timestamp headers to save 10-20% byte payload size.

### Key takeaway

Optimize images by **dynamically converting media to modern formats (WebP/AVIF)**, stripping metadata, and resizing assets at the edge based on client viewport parameters.
