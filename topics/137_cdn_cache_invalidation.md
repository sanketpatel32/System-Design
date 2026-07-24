# CDN Cache Invalidation

> **Category:** CDN and Media Delivery

---

CDN Cache Invalidation is the process of removing or purging stale cached assets from global edge servers before their explicit `Cache-Control` Time-To-Live (TTL) expires.

### Cache Invalidation Mechanisms

```
+-----------------------------------------------------------------------------------+
|                             Developer / CI/CD Pipeline                            |
+-----------------------------------------------------------------------------------+
                                          | Purge Command (API / Dashboard)
                                          v
+-----------------------------------------------------------------------------------+
|                             CDN Management Control Plane                          |
+-----------------------------------------------------------------------------------+
                                          | PubSub Broadcast (Sub-second Fanout)
                                          v
        +---------------------------------+---------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+-----------------+               +-----------------+               +-----------------+
| Edge PoP: US    |               | Edge PoP: EU    |               | Edge PoP: APAC  |
| (Purges /app.js)|               | (Purges /app.js)|               | (Purges /app.js)|
+-----------------+               +-----------------+               +-----------------+
```

### Invalidation Strategies Matrix

| Strategy | Mechanism | Propagation Speed | Cost / Origin Impact | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Hard Purge** | Explicitly deletes asset from edge cache | Fast (1-5 seconds) | High origin load spike | Security hotfixes, leak containment |
| **Soft Purge (Stale-While-Revalidate)**| Marks asset stale; serves stale while fetching origin | Fast | Low (Throttled origin fetch) | Regular content updates |
| **Cache Busting (URL Versioning)** | Appends file hash (`app.v2f8a.js`) | Instant (New URL) | Zero purge cost | Production JS/CSS assets |

### Cache Control Header Standards

- `Cache-Control: public, max-age=31536000, immutable`: Used for cache-busted static assets.
- `Cache-Control: no-cache, s-maxage=3600`: Requires edge servers to revalidate with origin using `ETag` or `If-Modified-Since` headers.

### Key takeaway

Prefer **URL versioning (cache busting)** over manual CDN purges for static assets. Use soft purges with `stale-while-revalidate` when dynamic content updates require immediate global invalidation.
