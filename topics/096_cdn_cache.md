# CDN Cache

> **Category:** Caching

---

A **Content Delivery Network (CDN) Cache** is a geographically distributed network of Edge Edge Points of Presence (PoPs) that cache static and dynamic web content close to end users. CDN caching reduces latency, offloads origin server bandwidth, and provides DDoS mitigation.

### Request routing architecture

```
 Client (London) -------> CDN Edge PoP (London) [CACHE HIT] --------> Fast Response (10ms)
                               |
                           Cache Miss
                               v
                       Origin Server (US-East) --------------------> Response (150ms)
```

### Core mechanisms & optimizations

1. **Edge Request Termination**: CDN PoPs terminate TCP and TLS connections close to the user, eliminating multi-roundtrip TLS handshake latency to distant origin servers.
2. **Cache Invalidation & Purging**:
   - **Time-Based Expiration**: Controlled by `Cache-Control: max-age` and `s-maxage` HTTP headers.
   - **Instant Purge**: Manual or API-driven cache purging by Tag, URL, or Prefix when content is updated.
3. **Dynamic Content Optimization**: CDN Edge Workers (Cloudflare Workers, AWS Lambda@Edge) execute lightweight code at the edge to transform responses, run AB tests, or authenticate requests.

### CDN Caching Configuration Matrix

| Header / Technique | Function | Edge Impact |
| :--- | :--- | :--- |
| **`s-maxage=<seconds>`** | Overrides `max-age` specifically for shared CDN caches | Prevents browser cache policies from affecting CDN edge TTLs |
| **`Cache-Control: public`**| Explicitly allows CDNs to cache responses | Enables edge caching for public API responses |
| **Origin Shield** | Centralized caching tier positioned between CDN edges and origin | Reduces origin load during cache stampedes across edge PoPs |
| **Stale-While-Revalidate**| Serves stale cached content while fetching updates in background | Delivers low latency while updating stale assets |

### Key takeaway

CDN caching minimizes user latency by serving content from geographically distributed edge PoPs. Use appropriate `s-maxage` headers, Origin Shields, and targeted purge APIs to maintain high edge hit ratios.
