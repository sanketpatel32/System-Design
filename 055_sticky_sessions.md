# Sticky Sessions

> **Category:** Load Balancing

---

Sticky sessions (session affinity) = **the LB routes requests from the same client to the
same backend server**. Required for stateful services.

### Why
Some services keep **per-session state in memory** (shopping cart, websocket connection, in-
memory session). If the next request goes to a different server, that state is lost.

### How to implement stickiness
| Method | How |
|--------|-----|
| **Cookie insertion** | LB sets a cookie like `SERVERID=abc` and routes by it. |
| **Application cookie** | App sets `JSESSIONID`, LB learns the mapping. |
| **IP hash** | LB hashes client IP → server. Coarse (NAT breaks it). |
| **URL parameter** | `?server=abc` in the URL (rare, ugly). |

### Trade-offs
- ✅ Enables stateful apps without a shared session store.
- ❌ Uneven load (one popular client overloads its server).
- ❌ Server failure = session loss (must replicate or persist sessions).
- ❌ Defeats auto-scaling / rebalancing.
- ❌ Breaks if clients rotate IPs (mobile).

### Better alternatives
- **Externalize session state** to Redis/DB. Then any server can serve any request — no
  stickiness needed.
- **Stateless JWT auth** — token carries claims, no server session.

### When sticky is OK
- **Migration period** while moving state out of memory.
- **Long-lived connections** (WebSocket) where you need the same server.
- **Cache locality** (request hits server with warm cache).

### Key takeaway
Sticky sessions are a **crutch** for stateful services. Prefer externalizing state (Redis,
JWT) so any server can serve any request. If you must use stickiness, use cookie-based (not IP
hash) and have a plan for server failure.
