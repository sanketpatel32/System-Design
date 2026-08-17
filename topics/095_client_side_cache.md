# Client-Side Cache

> **Category:** Caching

---

**Client-Side Caching** involves storing application data, static resources (images, JS, CSS), and API responses locally on the user's client device (browser, mobile application) to eliminate unnecessary network round trips to origin servers.

### Client-side lookup flow

```
                           +------------------------+
                           | User Action / Request  |
                           +------------------------+
                                       |
                                       v
                           +------------------------+
                           |  Check Local Cache     |
                           | (Memory / Disk / DB)   |
                           +------------------------+
                                  /          \
                      Cache Hit  /            \ Cache Miss
                                v              v
                    +---------------+  +---------------+
                    | Return Local  |  | Network Fetch |
                    | Payload (<1ms)|  | to Origin API |
                    +---------------+  +---------------+
```

### Mechanisms & standards

1. **HTTP Cache-Control Headers**:
   - `max-age=<seconds>`: Specifies how long the browser can serve cached content without revalidating.
   - `no-cache`: Requires revalidating with the origin server (using `ETag` or `If-Modified-Since`) before using cached content.
   - `no-store`: Prohibits storing responses locally (used for sensitive financial or personal data).
2. **Conditional Requests (`ETag` / `If-None-Match`)**: Browser passes document hash (`ETag`) to origin. If unchanged, server responds with `304 Not Modified` without re-sending the response body.
3. **Service Workers & PWA Storage**: Intercept network calls via JavaScript to implement custom caching strategies (e.g., Cache-First, Network-First).

### Client Storage Options Matrix

| Storage Mechanism | Capacity | Persistence | Best Used For |
| :--- | :--- | :--- | :--- |
| **HTTP Browser Cache**| ≈ 50-500 MB | Managed by browser HTTP policies | Static web assets (JS, CSS, Images, Fonts) |
| **IndexedDB** | High (>50% free disk) | Permanent until cleared by app | Offline PWA data, complex object stores |
| **LocalStorage** | ≈ 5 MB | Permanent until cleared by code | Non-sensitive UI state flags (Theme, Language) |
| **SessionStorage** | ≈ 5 MB | Tab session lifetime | Single-tab transient form inputs |

### Key takeaway

Client-side caching eliminates network overhead by serving resources directly from user device memory or disk. Use `Cache-Control` headers and Service Workers to balance instant local load times against stale asset risks.
