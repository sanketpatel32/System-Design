# Dynamic Content Delivery

> **Category:** CDN and Media Delivery

---

Dynamic content = **responses generated per-request** (user-specific data, search results,
recommendations). Harder to cache than static.

### Why CDN it
- Even uncacheable responses benefit from:
  - **TLS termination** at edge.
  - **Connection reuse** (keep-alive to origin).
  - **Compression** at edge.
  - **DDoS / WAF** protection.
  - **Routing** (geo, weighted).

### What can be cached
- **Public dynamic content**: news homepage (cache for 60s).
- **Personalized but bounded**: user's profile (cache with `Vary: Authorization`).
- **API responses with explicit TTL**: stock quotes (1s TTL).

### Cache strategies for dynamic

#### 1. Short TTL
- `Cache-Control: max-age=60` → stale up to 60s.
- Acceptable for many apps (news, listings).

#### 2. Stale-while-revalidate
- `Cache-Control: max-age=60, stale-while-revalidate=600`
- After TTL: serve stale + refetch in background.
- User gets fast stale response; cache stays fresh.

#### 3. Edge-side includes (ESI)
- Compose page from cacheable + uncacheable fragments.
- Edge assembles them.
- Cache the static parts; only fetch dynamic.

#### 4. Edge compute (Workers, Lambda@Edge)
- Personalize at edge (read cookie, modify response).
- Avoid origin round trip entirely.

### What NOT to cache
- Authenticated, sensitive responses (banking).
- Real-time data (stock ticker, live scores) — unless 1s TTL OK.
- User-specific dashboards (highly dynamic).

### Trade-offs
- ✅ Lower latency via edge TLS / compression / keep-alive.
- ✅ Cache public dynamic content with short TTL.
- ❌ Personalized content needs care (Vary, edge compute).
- ❌ Wrong caching leaks data between users.

### Key takeaway
Even dynamic APIs benefit from CDN: edge TLS, keep-alive, compression, DDoS. For cacheable
dynamic content, use short TTL + `stale-while-revalidate`. For personalization, use edge
compute (Workers) to avoid origin hits.
