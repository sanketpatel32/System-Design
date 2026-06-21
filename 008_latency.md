# Latency

> **Category:** System Design Basics

---

Latency = **time for a single request to complete.** Often confused with throughput; they are
independent (a system can have low latency and low throughput, or high latency and high
throughput).

### Latency sources (typical)
| Operation | Latency |
|-----------|---------|
| L1 cache reference | 0.5 ns |
| Main memory ref | 100 ns |
| SSD random read | 100 µs |
| Datacenter round trip | 500 µs |
| Same-region network call | 1 ms |
| Cross-region network call | 30-150 ms |
| HDD seek | 10 ms |
| DNS lookup | 20-120 ms |

### Distribution matters, not averages
Use **percentiles** (p50, p95, p99). Averages hide tail latency — a few 10-second outliers
disappear in a 200ms average.

### Reducing latency
- **Caching** — nearest/fastest data.
- **CDN** — move data close to users geographically.
- **Connection pooling** — avoid TCP handshake per request.
- **Async / batch** — don't block on slow ops.
- **Read replicas** — parallelize reads.
- **Colocate compute + data** — avoid cross-region hops.
- **Shrink payload** — gzip, protobuf, field projection (GraphQL).

### Key takeaway
Set a latency **SLO** (e.g. p99 < 200ms) and instrument it. Latency is experienced at the tail,
so always measure percentiles, never averages.
