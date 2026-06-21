# API Gateway

> **Category:** API Design

---

An API Gateway is the **single entry point** for all external API calls. It centralizes
cross-cutting concerns so individual services don't have to.

### What it does
```
Client -> [ API Gateway ] -> Service A
                        \-> Service B
                        \-> Service C
```
- **Routing**: map URL → backend service.
- **Authentication**: validate JWT/API key.
- **Rate limiting**: per-client quotas.
- **TLS termination**: HTTPS ends here.
- **Request/response transformation**.
- **Logging & metrics**: unified observability.
- **Caching**: cache common GET responses.
- **CORS, compression**.
- **Aggregation (BFF)**: combine multiple backend calls.

### Why use one
- **Decoupling**: clients see one stable API; backends evolve independently.
- **Centralized policy**: rate limits, auth, quotas in one place.
- **Operational simplicity**: one place to debug, monitor, version.
- **Polyglot backends**: gateway speaks REST to clients, gRPC internally.

### Patterns
- **Single gateway** (most common): one entry for everything.
- **Per-client gateway (BFF)**: one for web, one for mobile, one for partner — each tailored.
- **Layered**: external gateway → internal gateway → services.

### Popular options
- **Managed**: AWS API Gateway, Apigee, Kong Konnect, Cloudflare.
- **Self-hosted**: Kong, Tyk, Envoy, NGINX, Traefik.

### Trade-offs
- ✅ Centralized control, simpler services.
- ❌ New SPOF (must be HA).
- ❌ Latency (one extra hop).
- ❌ Can become a "god service" if you cram too much logic in.

### Key takeaway
Put an API Gateway in front of your services. It handles auth, rate limiting, TLS, routing, and
observability so your services stay focused on business logic. Keep it thin — don't embed
business rules.
