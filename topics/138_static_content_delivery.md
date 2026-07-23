# Static Content Delivery

> **Category:** CDN and Media Delivery

---

Static content = **files that don't change per-request**: images, CSS, JS, fonts, documents.

### Why CDN it
- Static content is **cacheable** — perfect for CDN.
- ~90% of typical web traffic is static.
- CDN absorbs it → origin load drops 10x.

### Cache strategy
```
Static assets:
  Cache-Control: public, max-age=31536000, immutable
  (1 year, never revalidate)

  URL contains hash: /app.a1b2c3.js
  Change content → change hash → new URL → new cache entry
```

### Versioned (hashed) URLs
- Build tools (Webpack, Vite) generate hashes from content.
- `app.a1b2c3.js` → file content never changes (immutable).
- New deploy → new hash → new URL.
- **Infinite TTL**, no invalidation needed.

### Long TTL with revalidation
```
Cache-Control: public, max-age=86400
ETag: "abc123"
```
- Cached for 1 day.
- On expiry, browser sends `If-None-Match: "abc123"`.
- If unchanged: 304 Not Modified (no body).
- If changed: 200 + new body.

### Static site hosting
- S3 + CloudFront = standard pattern.
- Or Cloudflare Pages, Vercel, Netlify.
- Cheap, fast, scalable.

### Compression
- gzip: 70% reduction.
- brotli: better than gzip, supported by modern browsers.
- CDN auto-compresses for clients.

### Image optimization
- WebP / AVIF: 30-50% smaller than JPEG.
- Responsive images (srcset) — different sizes per device.
- Lazy loading — defer offscreen images.

### Key takeaway
Static content belongs on a **CDN with long TTL + versioned URLs**. Hash content for immutable
URLs, set `max-age=31536000, immutable`, and let the CDN cache forever. Update = new hash = new
URL.
