# CDN Basics

> **Category:** CDN and Media Delivery

---

A Content Delivery Network (CDN) is a geographically distributed network of **Edge Servers (Points of Presence - PoPs)** designed to cache and deliver digital content (images, videos, HTML, JavaScript) with high availability and low latency by serving requests close to the user's location.

### High-Level CDN Request Flow Architecture

When a client requests a static asset, DNS routes the request to the nearest CDN Edge Server via Anycast IP routing.

```
+---------------+        1. HTTP GET /images/logo.png        +-----------------------+
|  User Client  | -----------------------------------------> |  CDN Edge Server      |
|  (Browser)    | <----------------------------------------- |  (Point of Presence)  |
+---------------+        4. Fast Return Cached Asset         +-----------------------+
                                                                  |            ^
                                              2. Cache Miss?      |            | 3. Fetch & Cache
                                              Forward to Origin   v            | Asset Payload
                                                             +-----------------------+
                                                             |  Origin Server        |
                                                             |  (S3 / Web Backend)   |
                                                             +-----------------------+
```

### Core CDN Terminology & Mechanics

- **Point of Presence (PoP)**: Data centers located in major internet exchange points containing edge caching servers.
- **Edge Server**: The frontend caching node that terminates TCP/TLS connections and directly serves client requests.
- **Origin Server**: The authoritative central server (e.g., S3 bucket or app server) holding master copies of assets.
- **Cache Hit Ratio (CHR)**: The percentage of total requests served directly by the edge cache without hitting origin. Formula:
**CHR** = (Cache Hits / (Cache Hits + Cache Misses)) × 100

### CDN Request Handling Comparison Matrix

| Scenario | Edge Action | Origin Load | User Latency | HTTP Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **Cache Hit** | Return cached asset directly | Zero load | Lowest (5-20 ms) | `200 OK` (Hit Header) |
| **Cache Miss** | Fetch from Origin, cache asset, return | High load spike | Higher (100-300 ms) | `200 OK` (Miss Header) |
| **Revalidation**| Send `If-None-Match` to Origin | Minimal (Header check) | Medium (50-100 ms) | `34 Not Modified` |

### Key Trade-offs & Engineering Best Practices

- ✅ **Drastic Latency Reduction**: Reduces round-trip time (RTT) by serving content from edge locations near users.
- ✅ **Origin Shielding**: Protects backend application infrastructure from massive traffic surges and DDoS attacks.
- ❌ **Stale Content Risk**: If cache headers are configured improperly, users may view outdated static assets.
- ❌ **Cache Invalidation Latency**: Purging cached assets globally across hundreds of edge locations takes several seconds to minutes.
### Production CDN Edge Caching Architecture Example

```http
# HTTP Response Headers from CDN Edge (Cloudfront / Cloudflare)
HTTP/1.1 200 OK
Content-Type: image/webp
Content-Length: 45210
Cache-Control: public, max-age=31536000, immutable
ETag: "w/68f3a9b1c2d3"
X-Cache: Hit from child-edge-us-east-1
X-Amz-Cf-Pop: IAD89-C1
Via: 1.1 8c3f9b.cloudfront.net (CloudFront)
```

### Cache Stampede (Thundering Herd) Protection

When a high-traffic asset expires from the CDN edge cache simultaneously across millions of users, thousands of concurrent requests bypass the cache and hit origin at once.
- **Origin Shield / Request Collapsing**: Modern CDNs collapse concurrent cache-miss requests at the edge PoP, forwarding only **one single consolidation request** to the origin server while holding other client requests until the origin returns the asset.

### Key takeaway

CDNs optimize static asset delivery by **terminating TLS and serving cached content at geographically distributed Edge PoPs**, reducing latency and shielding origin infrastructure.
