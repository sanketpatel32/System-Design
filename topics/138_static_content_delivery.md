# Static Content Delivery

> **Category:** CDN and Media Delivery

---

Static Content Delivery involves serving **unchanging web assets** (HTML files, CSS stylesheets, JavaScript bundles, images, fonts) to global users with minimal latency and high availability.

### Static Asset Delivery Pipeline

```
+--------+        1. HTTP GET /static/app.a9b1.js        +---------------+
| Client | --------------------------------------------> | CDN Edge Node |
+--------+                                               +---------------+
    ^                                                            |
    | 4. Return Asset (Cached)                                   | 2. Cache Miss (First Request)
    +------------------------------------------------------------+
                                                                 v
                                                         +---------------+
                                                         | Origin Store  |
                                                         | (AWS S3 Bucket|
                                                         +---------------+
```

### Optimization Checklist Matrix

| Technique | Implementation Details | Latency Reduction |
| :--- | :--- | :--- |
| **Brotli / Gzip Compression**| Compresses text payloads (CSS/JS) at edge | ~70% smaller bandwidth transfer |
| **HTTP/3 (QUIC)** | Uses UDP multiplexing to eliminate head-of-line blocking | 20-30% faster load on mobile networks |
| **Long-Term Cache Headers** | Sets `max-age=31536000` on immutable hashed filenames | Zero network requests on repeat visits |
| **Font Subsetting & Preloading**| Injects `<link rel="preload">` for critical render path fonts | Eliminates Flash of Unstyled Text (FOUT) |

### Scalability Considerations

- **Storage Decoupling**: Static assets should never be served directly from application server disks; upload build artifacts to S3/GCS during CI/CD deploy.

### Key takeaway

Optimize static content delivery by **serving versioned assets from object storage through a global CDN**, leveraging compression (Brotli) and aggressive browser caching.
