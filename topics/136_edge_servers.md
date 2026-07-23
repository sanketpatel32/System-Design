# Edge Servers

> **Category:** CDN and Media Delivery

---

Edge servers = **the CDN's points of presence (PoPs)** distributed globally, close to end
users.

### Topology
```
[Origin in Virginia]

PoPs (edge servers):
  - North America: NYC, LA, Toronto, Mexico City
  - Europe: London, Frankfurt, Paris, Stockholm
  - Asia: Tokyo, Singapore, Mumbai, Sydney
  - South America: São Paulo
  - Africa: Johannesburg, Nairobi
```

### What an edge server does
- **Caches content** (RAM + SSD).
- **Serves cached responses** directly.
- **Fetches from origin on miss**.
- **TLS termination**.
- **Compression**.
- **Routing** (geo, weighted).
- **WAF / DDoS mitigation**.

### Why edges win
- **Latency**: data near user → single-digit ms.
- **Throughput**: traffic spread across many PoPs.
- **Resilience**: one PoP down → others absorb.

### Types of PoPs
- **Major PoPs**: large, in metro areas (NYC, Tokyo).
- **Minor PoPs**: smaller, in regional areas.
- **Shield PoPs**: in front of origin, reduce origin load further.

### Edge compute (next-gen)
- **Cloudflare Workers, Fastly Compute, Lambda@Edge**: run code at the edge.
- Personalize responses, A/B test, route, transform — without origin round trip.
- Sub-50ms response time globally.

### Trade-offs
- ✅ Lower latency.
- ✅ Origin offload.
- ❌ Cache consistency (staleness).
- ❌ Operational complexity (debugging edge behavior).
- ❌ Cost.

### Real-world
- Cloudflare: 300+ cities, 100+ countries.
- Akamai: 1500+ networks, 130+ countries.
- CloudFront: 400+ PoPs.

### Key takeaway
Edge servers are the **physical locations** where CDN caches live. More PoPs = closer to users =
lower latency. Modern CDNs run **compute at the edge** (Workers, Lambda@Edge) for personalization
without origin hits.
