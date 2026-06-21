# Round Robin Load Balancing

> **Category:** Load Balancing

---

Round robin = **send each new request to the next server in a rotating list.** Simplest
non-random balancing strategy.

### How it works
```
Servers: [A, B, C]
Request 1 -> A
Request 2 -> B
Request 3 -> C
Request 4 -> A   (wrap around)
...
```

### Variants
- **Plain round robin**: equal turns, ignores server state.
- **Weighted round robin**: A gets 5/10, B gets 3/10, C gets 2/10 — based on capacity.
- **Smooth weighted round robin** (used by NGINX): spreads the weights evenly over time instead
  of bursts.

### When it works
- Servers are **roughly equal capacity**.
- Requests are **similar in cost**.
- Service is **stateless** (any server can handle any request).
- Connections are short-lived.

### When it fails
- **Mixed-capacity servers** — small server gets crushed (use weighted).
- **Long-lived / variable-cost connections** — some servers stuck on slow requests (use least
  connections).
- **Stateful workloads** — request lands on a server without the user's session (use sticky
  sessions).

### Pros
- Trivial to implement (counter + modulo).
- Stateless at the LB.
- Even load when assumptions hold.

### Cons
- Ignores current server load.
- Ignores response time.
- Uneven with unequal servers / variable request cost.

### Key takeaway
Round robin is the **default starting point** for stateless services with equal servers. Move to
**weighted** if servers differ, **least connections** if request cost varies, **consistent hash**
if you need stickiness.
