# CDN Basics

> **Category:** CDN and Media Delivery

---

A CDN (Content Delivery Network) is a globally distributed network of **edge servers** that
cache and serve content close to users.

### The problem
- Origin server in Virginia.
- User in Mumbai → 250ms round trip.
- 100ms added latency per request.
- Origin overloaded by global traffic.

### The solution
```
[User in Mumbai] -> [CDN edge in Mumbai]   (cache HIT) -> return
                          |
                          | (MISS)
                          v
                    [Origin in Virginia]
```
Edge caches popular content. Most users get a HIT — single-digit ms latency.

### What CDNs do
- **Cache static assets** (images, JS, CSS).
- **Cache dynamic content** (with care).
- **TLS termination** at the edge.
- **Compression** (gzip, brotli).
- **DDoS protection** (absorb volumetric attacks).
- **WAF** (block malicious requests).
- **Image optimization** (resize, format conversion).
- **Video streaming** (HLS segment caching).

### Popular CDNs
- **Cloudflare** — popular, free tier, feature-rich.
- **Akamai** — enterprise, huge footprint.
- **AWS CloudFront** — integrated with AWS.
- **Fastly** — programmable, real-time purge.
- **Google Cloud CDN** / **Azure CDN**.

### Cache hit ratio
- Target: > 95% for static content.
- Higher = better performance, lower origin load.

### Cache keys
- URL + query string (default).
- `Vary` header (e.g. cache differently per `Accept-Encoding`).

### Trade-offs
- ✅ Lower latency globally.
- ✅ Lower origin load.
- ✅ DDoS / WAF.
- ✅ Cheaper bandwidth.
- ❌ Adds cost per GB.
- ❌ Cache may serve stale data until TTL/purge.
- ❌ Dynamic content needs care.

### Key takeaway
A CDN is **mandatory** for any globally-served web product. Caches content at the edge, lowering
latency and origin load. Cloudflare/CloudFront/Fastly are common choices. Aim for > 95% cache
hit ratio.
