# Client-Side Cache

> **Category:** Caching

---

Client-side cache = **data stored on the user's device** (browser, mobile app) to avoid
network calls entirely.

### Where
- **Browser HTTP cache**: stores responses keyed by URL + headers.
- **Service Worker / Cache API**: programmable cache in the browser.
- **localStorage / sessionStorage**: small key-value store.
- **IndexedDB**: large structured store in the browser.
- **Mobile app local DB** (SQLite, Room, CoreData).

### HTTP caching headers
| Header | Meaning |
|--------|---------|
| `Cache-Control: max-age=3600` | Cache for 1 hour |
| `Cache-Control: public` | Any cache (incl. CDN) can store |
| `Cache-Control: private` | Only browser can store |
| `Cache-Control: no-cache` | Always revalidate with server |
| `Cache-Control: no-store` | Never cache |
| `ETag` | Version hash for revalidation |
| `Last-Modified` | Timestamp for revalidation |
| `Vary` | Cache separately per listed header |

### Validation flow
```
1. First request:    GET /img.png -> 200 OK + ETag: "abc"
2. Second request:   GET /img.png + If-None-Match: "abc"
3. If unchanged:     304 Not Modified (no body, super fast)
4. If changed:       200 OK + new body
```

### Trade-offs
- ✅ **Zero network** → fastest possible.
- ✅ **Offline support** (with service workers).
- ✅ **Reduces server load**.
- ❌ **Stale data** — must design invalidation.
- ❌ **Hard to debug** (cache state lives on user's device).
- ❌ **Security** — don't cache sensitive data on shared devices.

### When to use
- Static assets (images, JS, CSS).
- User-specific data that doesn't change often (profile, settings).
- API responses with explicit TTLs.

### Key takeaway
Use HTTP cache headers (`Cache-Control`, `ETag`) to cache aggressively on the client. Validate
with 304 Not Modified to keep data fresh without re-downloading. For rich offline experiences,
layer service workers + IndexedDB.
