# Bulkhead Pattern

> **Category:** Reliability and Fault Tolerance

---

Bulkhead = **isolating resources** so a failure in one part doesn't take down the whole
system. Like compartments in a ship's hull.

### The problem
```
Service A calls B, C, D.
B is slow.
A uses a single thread pool.
All threads stuck on B.
C and D calls also queue behind.
Entire service A unresponsive.
```

### The solution
**Separate thread pools** (or connections) per dependency:
```
Pool for B (10 threads)
Pool for C (10 threads)
Pool for D (10 threads)
```
B going slow doesn't affect C and D.

### Implementation
- Per-downstream **thread pool**.
- Per-downstream **connection pool**.
- Per-tenant isolation.
- Per-endpoint quotas.

### Bulkhead types

#### Thread pool bulkhead
- Each downstream gets its own pool.
- Slow downstream fills its pool, doesn't affect others.

#### Semaphore bulkhead
- Limit concurrent calls per downstream.
- Lighter than thread pools.

#### Tenant bulkhead
- Per-tenant limits (one noisy tenant doesn't starve others).

### Trade-offs
- ✅ Isolation — failures contained.
- ✅ Predictable per-downstream behavior.
- ❌ Overhead — multiple pools, idle resources.
- ❌ Configuration complexity.

### Real-world
- **Hystrix, Resilience4j** (Java).
- **Envoy, Istio** (service mesh with per-service limits).
- **API Gateway** per-tenant quotas.

### Combining patterns
- **Bulkhead** (isolation) +
- **Circuit breaker** (fail fast on sustained failure) +
- **Timeout** (bound each call) +
- **Retry** (transient recovery).
- Together: a resilient client.

### Key takeaway
Bulkheads isolate resources so one slow/failing dependency doesn't take down the whole service.
Use per-downstream thread pools or semaphores. Combined with circuit breakers + timeouts, you
get a properly resilient client.
