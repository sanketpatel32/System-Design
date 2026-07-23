# Horizontal Scaling

> **Category:** Scaling

---

Horizontal scaling (scale out) = **add more machines** (instances/nodes) to handle load.
The path to internet-scale.

### How
- App server: clone instances behind a load balancer.
- Database: read replicas (writes still one node) or sharding (writes distributed).
- Cache: Redis Cluster (multiple shards).

### Stateless services scale trivially
If the service keeps **no per-request state in memory**, any instance can serve any request.
Just add more behind an LB. This is the easy case.

### Stateful services are harder
- DBs need **replication** (read replicas) and/or **sharding** (partition data).
- Caches need **consistent hashing** to split keys.
- WebSockets need **shared pub/sub** to broadcast.

### Pros
- ✅ **No ceiling** — add machines as you grow.
- ✅ **Redundancy** — lose one, others carry on.
- ✅ **Elastic** — autoscale up and down.
- ✅ **Commodity hardware** — many small machines beat one big.

### Cons
- ❌ **Code complexity** — distributed state, consistency, retries.
- ❌ **Network calls** between nodes.
- ❌ **Operational overhead** — many machines to manage.
- ❌ **Load balancing** needed to spread traffic.
- ❌ **Harder debugging** (which instance?).

### When to choose
- Stateless web/API tiers — **always**.
- Database — when vertical scaling exhausted.
- Anything needing HA — horizontal gives you redundancy.

### Key takeaway
Horizontal scaling is the **only** way past single-machine limits and the path to HA. Keep your
**stateless tiers** truly stateless (externalize session, cache) so they scale by cloning.
