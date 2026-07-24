# Image Optimization

> **Category:** CDN and Media Delivery

---

Image optimization automates the **resizing, format conversion, compression, and delivery of image assets** based on the requesting client's screen dimensions, browser capabilities (User-Agent header), and network bandwidth. Performing image optimization dynamically at CDN edge nodes drastically cuts page load times and mobile data consumption.

### Dynamic Edge Image Optimization Workflow

The CDN edge inspects request headers (`Accept`, `Viewport-Width`), resizes images on-the-fly, converts formats to WebP/AVIF, and caches the result.

```
+------------------+     1. HTTP GET /image.jpg (Header Accept: image/avif)     +----------------------------------------------------+
| Client Browser   | ---------------------------------------------------------> | CDN Edge Server (Image Optimization Engine)        |
| (iPhone Display) | <--------------------------------------------------------- | - Inspects Accept Header -> Selects AVIF           |
+------------------+     4. Return Optimized AVIF (30KB)                        | - Inspects Device Width -> Resizes 1920px to 400px |
                                                                                +----------------------------------------------------+
                                                                                                          |
                                                                                     2. Fetch Master      | 3. Store Processed
                                                                                        Original          v    Variant in Cache
                                                                                +----------------------------------------------------+
                                                                                | Origin Storage (Raw Uncompressed 5MB Master Image) |
                                                                                +----------------------------------------------------+
```

### Image Format Selection Matrix

| Image Format | Compression Type | Transparency | Animated | Typical Size Reduction | Best Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JPEG** | Lossy | No | No | Baseline (100%) | Legacy browsers fallback |
| **PNG** | Lossless | Yes | No | 150%-200% | Vector art, sharp logos, icons |
| **WebP** | Lossy / Lossless | Yes | Yes | 30% smaller than JPEG | Default web/mobile display format |
| **AVIF** | Lossy / Lossless | Yes | Yes | 50% smaller than JPEG | High-density modern display formats |

### Key Optimization Strategies

1. **Next-Gen Format Negotiation**: Intercept HTTP `Accept` headers to deliver WebP/AVIF automatically without altering HTML source image tags.
2. **Responsive Variant Generation**: Use `srcset` and `sizes` HTML attributes or URL query parameters (`/img.jpg?width=600&quality=85`) to serve exact dimension fit for target viewports.
3. **Lossy Compression Tuning**: Standardize lossy compression at quality level 80%-85%; this delivers imperceptible visual degradation while trimming file size by 50%+.
4. **Metadata Stripping**: Automatically strip EXIF data (camera model, GPS coordinates, timestamps) to protect user privacy and shave byte overhead.

### Key Trade-offs & Cost Factors

- ✅ **Massive Bandwidth Savings**: Reduces page size by up to 70%, boosting Core Web Vitals (LCP) performance.
- ❌ **Edge CPU & Storage Cache Inflation**: Generating multiple resolution/format combinations for millions of images increases edge storage footprint and first-request processing CPU time.
### HTML5 Responsive Image Tag Implementation Pattern

```html
<!-- Client HTML selecting optimal CDN image variant -->
<picture>
  <!-- Next-Gen AVIF for modern supporting browsers -->
  <source srcset="https://cdn.example.com/hero.jpg?format=avif&width=800 800w,
                  https://cdn.example.com/hero.jpg?format=avif&width=1600 1600w"
          type="image/avif">
  
  <!-- Fallback WebP for standard browsers -->
  <source srcset="https://cdn.example.com/hero.jpg?format=webp&width=800 800w,
                  https://cdn.example.com/hero.jpg?format=webp&width=1600 1600w"
          type="image/webp">
  
  <!-- Fallback standard JPEG -->
  <img src="https://cdn.example.com/hero.jpg?width=800" 
       alt="Hero Display" 
       loading="lazy" 
       decoding="async">
</picture>
```

### Production Image Transformation API Specifications

- `GET /img/photo.jpg?width=600&height=400&fit=crop&format=auto&quality=80`
- `format=auto`: Inspects browser `Accept` header. Serves AVIF if supported, WebP if fallback, JPEG as last resort.
- `fit=crop`: Crops image around AI-detected face/center-of-interest bounding box.

### Key takeaway

Image optimization **transforms raw images into next-gen formats (WebP/AVIF) and exact viewport sizes at the CDN edge**, maximizing visual performance while minimizing network payload size.
