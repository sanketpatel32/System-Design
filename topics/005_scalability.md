# Scalability

> **Category:** System Design Basics

---

Scalability is the system's ability to **handle growing load** — more users, more data, more
requests — without degrading performance.

### Two directions
- **Vertical (scale up)**: bigger machine (more CPU/RAM). Simple, but hits a ceiling and is a
  single point of failure.
- **Horizontal (scale out)**: more machines. Harder (state must be shared) but practically
  unbounded.

### Three axes (sometimes called "the scale cube")
```
           X-axis  : clone   (more identical instances)
          /           Y-axis : split by function (auth svc, payment svc, ...)
          \        /
           Z-axis  : split by data    (sharding by user_id)
```

### Where bottlenecks appear, in order
1. **App server** (CPU) → clone horizontally behind a load balancer.
2. **Database** (reads) → read replicas.
3. **Database** (writes) → sharding, write-through cache.
4. **Cache** (hit rate / size) → distributed cache, eviction tuning.
5. **Network** (bandwidth) → CDN, compression.

### Scaling patterns
- **Stateless services** → trivially cloned.
- **Read replicas** → fan out reads.
- **Sharding** → partition data across nodes.
- **Caching** → absorb read load.
- **Async processing** → queue writes, decouple producers/consumers.
- **CDN** → push content close to users.

### Key takeaway
Design for horizontal scale from day one for **stateless** parts; only shard databases when you
must (it adds enormous operational complexity).
