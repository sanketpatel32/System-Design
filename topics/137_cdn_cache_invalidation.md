# CDN Cache Invalidation

> **Category:** CDN and Media Delivery

---

CDN cache invalidation is the process of **purging or updating cached assets** stored on edge servers before their configured Time-To-Live (TTL) expires. It guarantees that users receive the latest version of static assets immediately after an update on the origin server.

### Cache Invalidation Architectural Flow

When origin content changes, an explicit purge request is dispatched across the global CDN control plane to flush or revalidate edge node cache entries.

```
+------------------+       1. Content Modified on Origin       +--------------------+
| Application      | ----------------------------------------> | Origin Storage     |
| Developer / CI   |                                           | (S3 Bucket)        |
+------------------+                                           +--------------------+
        |
        | 2. Issue Cache Purge API Call (`PURGE /images/v2/logo.png`)
        v
+-----------------------------------------------------------------------------------+
| CDN Control Plane API                                                             |
| - Broadcasts invalidation signal to 300+ Edge PoPs globally via gossip/pubsub     |
+-----------------------------------------------------------------------------------+
        |
        +-----------------------------------+-----------------------------------+
        v                                   v                                   v
+-------------------+               +-------------------+               +-------------------+
| Edge PoP: US-East |               | Edge PoP: EU-West |               | Edge PoP: AP-East |
| (Invalidates RAM) |               | (Invalidates RAM) |               | (Invalidates RAM) |
+-------------------+               +-------------------+               +-------------------+
```

### Invalidation Strategies Comparison Matrix

| Strategy | Mechanism | Purge Speed | Origin Load Surge Risk | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Hard Purge** | Evicts content from edge storage immediately | Immediate | High (Causes sudden cache miss stampede) | Emergency security hotfix, leak removal |
| **Soft Purge (Invalidate)**| Marks item stale; serves stale while fetching fresh | Fast | Low (Graceful background update) | Routine content updates |
| **Cache Bypassing (Cache-Control: no-cache)**| Forces HTTP `304 Not Modified` revalidation | Instant | Medium (Origin hit for headers) | Frequently updating config files |
| **URL Versioning (Cache Busting)**| Appends unique hash to asset filename (`app.3a8f.js`)| Instant (Zero CDN Purge API calls) | Zero (New URL is fresh cache hit) | Continuous Deployment asset pipelines |

### HTTP Cache-Control Directives Reference

- **`max-age=<seconds>`**: Specifies maximum duration an asset is considered fresh by edge and browser.
- **`s-maxage=<seconds>`**: Overrides `max-age` specifically for public CDN caches, leaving browser TTL unaffected.
- **`stale-while-revalidate=<seconds>`**: Serves stale cached content immediately while fetching an update asynchronously from origin.
- **`immutable`**: Signals that the asset payload will never change (e.g. hashed filenames), preventing unnecessary revalidation.

### Trade-offs & Production Risks

- ✅ **Instant Asset Updates**: Ensures critical UI fixes or security patches reach users without waiting for TTL expiration.
- ❌ **Thundering Herd Problem**: Sudden hard purges of high-traffic assets cause thousands of concurrent cache misses, crashing origin servers. Use **Soft Purge** or **Cache Lock** settings.
- ❌ **CDN API Rate Limits & Costs**: Issuing wild-card purges (`/*`) frequently incurs API charges and can take minutes to propagate globally.
### Production Invalidation API Call Example (AWS CloudFront CLI)

```bash
# Invalidate specific image asset across global CDN PoPs
aws cloudfront create-invalidation \
    --distribution-id E1A2B3C4D5E6F7 \
    --paths "/images/v2/logo.png" "/css/styles.css"

# Check status of global propagation
aws cloudfront get-invalidation \
    --distribution-id E1A2B3C4D5E6F7 \
    --id IV1A2B3C4D5E6
```

### Invalidation vs Versioning Decision Matrix

- **Always Prefer URL Versioning (Cache Busting)**: For deployed JavaScript and CSS bundles (`app.8c3f.js`), deploy new filenames alongside old ones. This eliminates CDN API purge latency and guarantees zero origin load spikes.
- **Use Manual Invalidation Only For**: Emergency security removals (e.g. accidental key upload), legal takedowns, or updating static un-hashed assets (`robots.txt`, `favicon.ico`).

### Key takeaway

Prefer **URL Versioning (Cache Busting)** for static deployment assets. When manual CDN cache invalidation is required, use **Soft Purge** to prevent origin load stampedes.
