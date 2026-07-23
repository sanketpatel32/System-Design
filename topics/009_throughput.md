# Throughput

> **Category:** System Design Basics

---

Throughput = **work completed per unit time** — requests/sec, messages/sec, bytes/sec. The
question it answers: *"how much load can we move?"*

### Throughput vs latency (Little's Law)
```
L = λ × W
concurrent requests = (arrival rate) × (response time)
```
If each request takes 100ms and you want 10,000 req/s, you need **1000 concurrent in-flight
requests** — that dictates your connection pool, thread pool, and instance count.

### Increasing throughput
- **Scale horizontally** (more instances).
- **Parallelize** (async I/O, batching).
- **Pipeline** (Kafka — producers don't wait for consumers).
- **Connection reuse** (HTTP keep-alive, gRPC multiplexing).
- **Backpressure** — drop or queue excess instead of collapsing.

### Where systems cap out
- CPU-bound → add cores / instances.
- I/O-bound → async I/O (don't waste threads waiting).
- Network-bound → compress, batch, CDN.
- DB-bound → replicas, sharding, caching.

### Key takeaway
Throughput scales by **removing serial bottlenecks**. Find the slowest serial step (often a DB
write or a lock) and parallelize everything around it.
