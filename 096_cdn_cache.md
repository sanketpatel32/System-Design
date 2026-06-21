# CDN Cache

> **Category:** Caching

---

A CDN (Content Delivery Network) cache = **edge servers worldwide that serve cached content
close to users**. The first major caching layer beyond the browser.

### What CDNs cache
- **Static assets**: images, CSS, JS, fonts.
- **Static HTML**.
- **API responses** with explicit cache headers.
- **Video / audio streaming segments**.

### Why
- **Latency**: user in Mumbai fetches from a Mumbai edge, not your Virginia datacenter.
- **Throughput**: offloads 90%+ of traffic from your origin.
- **Cost**: CDN bandwidth is cheaper than origin egress.
- **Availability**: edge can serve even if origin is down.

### How it works
```
User in Tokyo
   |
   v
CDN edge in Tokyo (cache HIT?) -> return immediately
   |
   v (cache MISS)
Origin in Virginia -> fetch, cache at edge, return
```

### Cache keys
- URL + query string.
- `Vary` header (e.g. cache separately for different `Accept-Language`).

### TTL
- Set via `Cache-Control: max-age` from origin.
- Long TTL for static assets (1 year for hashed assets).
- Short TTL for dynamic content (60s).

### Invalidation
- **TTL expiry** — natural.
- **Purge** — explicit API call ("invalidate /images/foo.png").
- **Versioned URLs** — `/app.v123.js` instead of invalidating.
- **Surrogate keys** — Cloudflare / Fastly tag groups of URLs.

### Trade-offs
- ✅ Massive latency + throughput win.
- ✅ Cheaper than origin.
- ❌ Adds cost per GB delivered.
- ❌ Cache may serve stale content for up to TTL.
- ❌ Dynamic / personalized content needs care.

### Key takeaway
For any web product serving users globally, a CDN is mandatory. Cache static assets at the edge
with long TTLs; use purge or versioned URLs for updates. The CDN typically handles 90%+ of
traffic.
