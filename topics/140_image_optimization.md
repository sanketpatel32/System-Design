# Image Optimization

> **Category:** CDN and Media Delivery

---

Image optimization = **delivering images in the right format, size, and quality** for each
client. Reduces bandwidth and improves load times.

### Why
- Images are the **largest** fraction of page weight (often 60%+).
- Mobile users on slow connections suffer most.
- Bandwidth costs real money (egress).

### Techniques

#### 1. Modern formats
| Format | Savings vs JPEG | Browser support |
|--------|-----------------|-----------------|
| WebP   | 25-35%          | Modern browsers |
| AVIF   | 50%             | Newer browsers |
| JPEG XL | 60%            | Emerging |
| JPEG   | baseline        | All |
| PNG    | Lossless        | All (graphics) |

Use `<picture>` with multiple `<source>` to deliver the best the browser supports.

#### 2. Responsive images
```html
<img srcset="img-200.jpg 200w, img-500.jpg 500w, img-1000.jpg 1000w"
     sizes="(max-width: 600px) 200px, 500px"
     src="img-500.jpg">
```
Browser picks the best size — doesn't download a 4K image for a 200px display.

#### 3. Lazy loading
```html
<img src="img.jpg" loading="lazy">
```
Defer offscreen images until user scrolls. Saves bandwidth.

#### 4. Compression
- Lossy: 70-80% quality usually indistinguishable.
- Lossless for graphics / screenshots.

#### 5. CDN on-the-fly
- Cloudflare, Cloudinary, Imgix: transform images at the edge.
- `?width=500&format=webp` — server resizes and converts.

### Workflow
```
1. User uploads raw image to S3.
2. Lambda creates variants: thumbnail, medium, large, WebP, AVIF.
3. CDN serves appropriate variant per request.
4. Client uses <picture> to pick.
```

### Measuring
- Lighthouse, PageSpeed Insights.
- Target: images < 100KB on mobile.

### Key takeaway
Image optimization = **modern formats (WebP/AVIF) + responsive sizes + lazy loading + CDN
on-the-fly transforms**. Cuts bandwidth 50-80% and dramatically improves mobile UX.
