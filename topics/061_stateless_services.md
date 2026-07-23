# Stateless Services

> **Category:** Scaling

---

A stateless service = **no per-request state stored in the process between requests.** Every
request carries everything it needs. The service is a pure function of its inputs (+ shared
external stores).

### Why statelessness is gold
- **Clone infinitely** — any instance serves any request.
- **No sticky sessions** needed.
- **Trivial autoscaling** — add/remove instances freely.
- **Zero-downtime deploys** — drain one, deploy, repeat.
- **No session loss** on instance failure.

### How to achieve it
| State | Externalize to |
|-------|----------------|
| User session | Redis / JWT |
| File uploads | S3 |
| Cache | Redis / Memcached |
| Background jobs | Queue (SQS, Kafka) |
| Configuration | DB / config service |

### Example: HTTP request
```
GET /api/orders
Authorization: Bearer <jwt>
Cookie: cart_id=abc
```
The request includes everything (JWT, cart ID). The app fetches state from DB/cache, processes,
returns. **Nothing about this request stays in memory** after the response is sent.

### Common statefulness leaks
- **In-memory caches** (per-instance hit-rate differences).
- **In-memory session maps**.
- **Background timers / schedulers** that only fire on one instance.
- **WebSockets** holding connection state.

### Fixing leaks
- Move caches to **Redis** (shared).
- Move sessions to **JWT or Redis store**.
- Use **distributed scheduler** (Quartz, Celery beat with leader election).
- Route WebSockets through a **shared pub/sub**.

### Key takeaway
The simplest path to horizontal scale is **statelessness**. Audit your service for any per-
instance state and externalize it (Redis, S3, DB, queue). Then scaling becomes cloning.
