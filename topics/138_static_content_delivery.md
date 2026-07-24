# Static Content Delivery

> **Category:** CDN and Media Delivery

---

Static content delivery involves serving immutable assets—such as HTML files, CSS stylesheets, JavaScript bundles, images, fonts, and PDFs—that do not change dynamically based on individual user state. It relies on aggressive CDN caching, HTTP compression, and cache-busting URLs.

### End-to-End Static Content Delivery Architecture

Static assets are built during CI/CD, deployed directly to cloud object storage, and delivered via CDN edge locations using long-term caching headers.

```
+--------------------+        1. CI/CD Build & Version Assets        +--------------------+
| GitHub Actions     | --------------------------------------------> | Object Storage     |
| (Webpack/Vite)     |   (e.g., main.8c3f.js -> Cache 1 Year)        | (S3 / GCS Bucket)  |
+--------------------+                                               +--------------------+
                                                                               |
                                                                               | 2. Edge Cache Fetch
                                                                               v
+---------------+             3. Request Asset (main.8c3f.js)        +--------------------+
| User Browser  | -------------------------------------------------> | CDN Edge Server    |
|               | <------------------------------------------------- | (Point of Presence)|
+---------------+             4. Serve Cached Asset (HTTP 200)       +--------------------+
```

### Static Asset Optimization Checklist

| Technique | Implementation Details | Performance Gain |
| :--- | :--- | :--- |
| **Brotli / Gzip Compression** | Pre-compress text assets (`.js`, `.css`, `.html`) at origin | 60%-80% size reduction compared to raw files |
| **Cache-Busting Filenames** | Embed content hash in filename (`styles.a9b1c2.css`) | Allows 1-year immutable caching (`max-age=31536000`) |
| **HTTP/2 & HTTP/3 Multiplexing**| Serve assets over single TCP/UDP connection | Eliminates browser domain sharding and head-of-line blocking |
| **Resource Hints (`preload`)**| `<link rel="preload" href="font.woff2" as="font">` | Cuts Critical Rendering Path (CRP) network latency |

### Cache-Control Header Rules for Static Files

```http
# Immutable Hashed Assets (JS, CSS, Media)
Cache-Control: public, max-age=31536000, immutable

# Entry Point Files (index.html) - Must Revalidate Always
Cache-Control: no-cache, no-store, must-revalidate
```

### Key Trade-offs & Production Considerations

- ✅ **Near-Zero Origin Server Load**: 99%+ of static traffic is absorbed directly by CDN edge nodes.
- ✅ **Blazing Fast Page Load Speeds**: Reduces First Contentful Paint (FCP) and Largest Contentful Paint (LCP) web vital metrics.
- ❌ **Stale HTML Bootstrapping**: If `index.html` is cached incorrectly without revalidation, users will load outdated JavaScript bundle references.
### Production NGINX Origin Configuration for Static Assets

```nginx
# NGINX Static Content Caching & Compression Rules
server {
    listen 80;
    server_name static.example.com;
    root /var/www/static;

    # Enable Gzip and Brotli Compression
    gzip on;
    gzip_types text/plain text/css application/javascript image/svg+xml;

    # Immutable Hashed Assets (JS, CSS, Media)
    location ~* \.[a-f0-9]{8,32}\.(js|css|png|jpg|webp)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # HTML Entrypoints - Always Revalidate
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Key Performance Metrics & Web Vitals Impact

- **Largest Contentful Paint (LCP)**: Serving static hero images and fonts via CDN edge servers reduces LCP from > 4.0s to < 1.2s.
- **First Contentful Paint (FCP)**: Pre-compressed Brotli CSS served over HTTP/3 eliminates render-blocking network delays.

### Key takeaway

Static content delivery requires **aggressive long-term caching for hashed assets (`immutable`) alongside un-cached revalidated entry-points (`index.html`)**, offloading network traffic to the CDN edge.
