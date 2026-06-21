# Load Balancer Basics

> **Category:** Load Balancing

---

A load balancer **distributes incoming traffic across multiple servers** so no single server is
overloaded, and so the system stays available if a server dies.

### Where it sits
```
                +--> Server 1
Client -> [LB] -+--> Server 2
                +--> Server 3
```

### What it does
- **Distributes load** — round-robin, least-connections, consistent hash, etc.
- **Health checks** — only sends traffic to healthy servers.
- **TLS termination** — ends HTTPS here, talks HTTP to backends.
- **Session affinity** — pins a client to a server (sticky sessions).
- **Layer 4 or Layer 7** — see dedicated topics.

### Why it matters
- **Availability**: lose a server, traffic reroutes.
- **Scalability**: add servers, LB spreads load.
- **Maintainability**: drain a server for deploy, others take over.

### Key algorithms (see dedicated topics)
| Algorithm | Best for |
|-----------|----------|
| Round robin | Equal-capacity servers, stateless |
| Least connections | Long-lived connections (chat, WS) |
| IP hash / consistent hash | Sticky sessions, cache locality |
| Weighted | Mixed-capacity servers |
| Random | Simple, rarely used alone |
| Least response time | Latency-sensitive (advanced) |

### Health checks
- **Active**: LB pings `/health` periodically.
- **Passive**: LB marks unhealthy after N consecutive failures.
- **Draining**: stop new requests, let in-flight finish, then remove.

### Redundancy
The LB itself must be **highly available** — typically a primary + standby pair with VIP
failover (VRRP/Keepalived), or a managed cloud LB.

### Key takeaway
A load balancer is mandatory the moment you have more than one server. It distributes load,
performs health checks, terminates TLS, and enables zero-downtime deploys. Always make the LB
itself redundant.
