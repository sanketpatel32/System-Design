# Design API Gateway

> **Category:** Beginner System Design Problems

---

Design an API Gateway: a single entry point handling routing, auth, rate limiting, and more.

### Requirements
- **Functional**: route requests to backends; auth; rate limit; transform.
- **Non-functional**: low-latency; high-throughput; HA.

### Architecture
```
[Client] -> [API Gateway]
              |
              +-> Auth (validate JWT)
              +-> Rate limit (Redis)
              +-> Route (/users -> user-svc, /orders -> order-svc)
              +-> Transform (rewrite, aggregate)
              +-> Log/metrics
              v
           [Backend services]
```

### Components
1. **TLS termination**.
2. **Routing** (URL → backend).
3. **Authentication** (JWT, API key).
4. **Rate limiting** (Redis-backed).
5. **Request/response transformation**.
6. **Logging + metrics**.
7. **Caching** for GETs.
8. **Aggregation** (BFF pattern).

### Scaling
- Stateless → clone horizontally.
- Per-instance rate limit counters + shared Redis for global accuracy.
- Connection pooling to backends.

### HA
- Multi-AZ deployment.
- Health checks + failover.
- Backpressure to backends.

### Real-world
- Kong, Tyk, AWS API Gateway, Apigee, Envoy + Istio.

### Key takeaway
API Gateway centralizes cross-cutting concerns: auth, rate limit, routing, observability.
Keep it thin — don't put business logic. Stateless → clone for scale. Multi-AZ for HA.
