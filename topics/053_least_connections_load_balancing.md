# Least Connections Load Balancing

> **Category:** Load Balancing

---

Least connections = **send each new request to the server currently handling the fewest
active connections.** Better than round robin when request cost varies.

### How it works
```
Current active connections:
  A: 12
  B: 8   <- least, send here
  C: 15

New request -> B (now B has 9)
```

### Why it beats round robin
- Round robin ignores that server A might be stuck on 5 long-lived requests.
- Least-connections adapts to **variable request duration**.

### When to use
- **Long-lived connections** (WebSockets, streaming).
- **Variable-cost requests** (some take 10ms, some take 10s).
- **Mixed-capacity servers** (with weighted variant).

### Variant: weighted least connections
Multiplies connection count by a server weight so bigger servers handle proportionally more.

### Variant: least response time
Combines connection count + average response time. More accurate, harder to compute (needs EWMA
of latency per server).

### Trade-offs
- LB must **track active connections** per server (stateful LB).
- Slow to react to a server that just got fast.
- Needs accurate bookkeeping; connection churn can mislead.

### Where it shines
- Chat / messaging (long-lived WS).
- File upload / video streaming.
- API gateways with mixed endpoint costs.

### Key takeaway
Pick **least connections** when request durations vary widely or connections are long-lived.
For uniform, short-lived, stateless traffic, round robin (or weighted) is fine and cheaper.
