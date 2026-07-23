# CDN Cache Invalidation

> **Category:** CDN and Media Delivery

---

CDN cache invalidation = **ensuring edge caches don't serve stale content** after origin
updates.

### Approaches

#### 1. TTL (time-to-live)
- Each cached object has an expiry.
- After TTL, edge refetches from origin.
- Simple, but allows staleness up to TTL.

#### 2. Purge
- Explicit API call to invalidate.
- Two flavors:
  - **URL purge**: invalidate specific URL.
  - **Wildcard / surrogate key purge**: invalidate groups ("all /products/*").
- Fastly is famous for sub-second surrogate-key purges.

#### 3. Versioned URLs
- New version = new URL.
- `/app.v123.js` → `/app.v124.js`.
- Old URL stays cached (no invalidation needed).
- Standard for hashed assets (Webpack, Vite).

#### 4. Soft purge
- Mark as stale, but serve stale while refetching.
- Avoids latency spike on hard purge.

### The invalidation problem
> "There are only two hard things in CS: cache invalidation and naming things."

- Long TTL → stale data.
- Short TTL → more origin hits.
- Purge is global → can thundering-herd the origin.

### Best practices
- **Versioned URLs** for static assets (immutable, infinite TTL).
- **Short TTL** for content that changes (60s for product pages).
- **Purge on update** for things that must be fresh immediately.
- **Soft purge** to avoid spikes.

### Cloudflare example
```
POST /zones/{id}/purge_cache
{ "files": ["https://example.com/img/cat.jpg"] }
```

### Trade-offs
| Approach | Pros | Cons |
|----------|------|------|
| TTL only | Simple | Stale data |
| Purge | Fresh | Operations overhead |
| Versioned | Immutable | Need to update references |
| Soft purge | No spike | Briefly stale |

### Key takeaway
For immutable assets (hashed JS/CSS), use **versioned URLs with infinite TTL** — never
invalidate. For dynamic content, use short TTL or **purge on update**. Prefer **soft purge** to
avoid thundering herds on origin.
