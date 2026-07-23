# Layer 7 Load Balancing

> **Category:** Load Balancing

---

Layer 7 (L7) load balancing operates at the **application layer** — it inspects the HTTP
request (URL, headers, cookies, body) to make routing decisions.

### How it works
```
Client -> LB
         LB reads: GET /api/v1/users  Host: api.example.com  Cookie: session=abc
         LB routes /api/* -> api-service
         LB routes /static/* -> cdn-origin
         LB rewrites Host header, sets X-Forwarded-For, terminates TLS
```

### What L7 can do that L4 can't
- **Path-based routing**: `/api/*` → service A, `/images/*` → service B.
- **Host-based routing**: `api.x.com` vs `www.x.com`.
- **Header/cookie inspection**: stick sessions, A/B testing.
- **TLS termination + SNI**: serve multiple certs on one IP.
- **Request/response transformation**: rewrite, compress, add headers.
- **Caching**: serve common GETs from the LB.
- **Authentication**: validate JWT before forwarding.
- **Rate limiting** per route.

### Common L7 LBs / Reverse proxies
- **NGINX, HAProxy (HTTP mode), Envoy, Traefik, Caddy**.
- **AWS ALB, GCP HTTP(S) LB, Azure App Gateway**.
- Often called **reverse proxy** when in front of internal services.

### Reverse proxy vs forward proxy
- **Reverse** (you use one): client → proxy → your servers. Hides your servers.
- **Forward** (corporate): client → proxy → internet. Hides clients.

### Trade-offs vs L4
- ✅ Rich features (caching, auth, routing).
- ✅ Better observability (sees full request).
- ❌ Slower (must parse HTTP).
- ❌ Higher CPU/memory.
- ❌ One more place to break TLS / inspect data.

### Key takeaway
Use L7 (reverse proxy) when you need **content-aware routing, caching, TLS termination with SNI,
or HTTP-level policies**. Modern stacks almost always put an L7 LB at the edge (NGINX, Envoy,
AWS ALB).
