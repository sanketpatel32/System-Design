# Reverse Proxy

> **Category:** Load Balancing

---

A reverse proxy sits **in front of your servers** and forwards client requests to them.
It's the Swiss-army knife of edge infrastructure.

```
Client -> [ Reverse Proxy ] -> App server(s)
```

### What it does
- **TLS termination** — HTTPS ends here; plain HTTP to backends.
- **Load balancing** — distribute across many backends.
- **Routing** — `/api/*` to one service, `/static/*` to another.
- **Caching** — store hot responses.
- **Compression** — gzip/brotli for clients.
- **Rate limiting** — protect backends.
- **Authentication** — validate JWT before forwarding.
- **DDoS protection** — absorb slow-loris, SYN floods.
- **Observability** — centralized logging/metrics.
- **Canary / blue-green** deploys via routing.

### Reverse vs forward proxy
| | Reverse | Forward |
|--|---------|---------|
| Hides | Servers | Clients |
| Used by | Web services | Corporate egress |
| Example | NGINX, Cloudflare | Squid, corporate proxy |

### Popular options
- **NGINX** — battle-tested, ubiquitous.
- **HAProxy** — excellent L4 + L7, very fast.
- **Envoy** — modern, programmable, Istio's data plane.
- **Traefik, Caddy** — auto-TLS, container-friendly.
- **Cloudflare, AWS CloudFront** — managed, edge-deployed.

### Common patterns
- **Edge proxy** (Cloudflare) → **ingress proxy** (NGINX in k8s) → **service mesh sidecar**
  (Envoy) → service.
- Each layer handles different concerns; don't duplicate.

### Key takeaway
A reverse proxy is **mandatory** in any production web stack. It centralizes TLS, routing,
caching, rate limiting, and observability so your services stay simple. NGINX/Envoy/Cloudflare
are the dominant choices.
