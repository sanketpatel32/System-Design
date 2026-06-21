# Health Checks

> **Category:** Load Balancing

---

Health checks = **periodic probes** that tell the LB whether a backend can receive traffic.
Sick backends are removed from rotation; recovered ones are re-added.

### Two types
1. **Active** — LB sends a probe (`GET /health`) every few seconds.
2. **Passive** — LB watches real requests; after N consecutive 5xx/timeouts, mark unhealthy.

### Health endpoint contract
```
GET /health
200 OK {"status":"healthy","db":"up","cache":"up"}
503 Service Unavailable  -> unhealthy
```
Some teams split `/health` (liveness) from `/ready` (readiness):
- **Liveness** — "is the process alive?" — kubelet restarts if not.
- **Readiness** — "can I serve traffic?" — LB pulls me out if not.

### What to check
- Process is up and not deadlocked.
- Can reach DB / cache / downstream services.
- Not in maintenance / draining mode.
- Not OOM / GC-thrashing.

### Tuning
- **Interval**: every 5-10s (too frequent = overhead, too rare = slow failover).
- **Timeout**: 2s.
- **Unhealthy threshold**: 3 consecutive failures.
- **Healthy threshold**: 2 consecutive successes (avoid flapping).

### Common bugs
- Health endpoint always returns 200 (because it doesn't actually check DB).
- Health endpoint hits DB on every check → self-DoS.
- LB uses 200 vs 5xx but app returns 200 with `{"status":"unhealthy"}` (no machine-readable
  check).

### Key takeaway
A health endpoint must **actually verify** dependencies (DB, cache) — not just return 200. Tune
intervals to balance failover speed against probe overhead. Combine active checks with passive
(5xx-spike) detection.
