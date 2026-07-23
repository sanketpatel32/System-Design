# Eventual Consistency

> **Category:** Distributed Systems

---

Eventual consistency = **given no new writes, all replicas eventually converge to the same
value.** The relaxed model that powers highly available systems.

### The promise
- Reads may be **stale** for a brief window.
- Eventually, all replicas agree.
- No guaranteed time bound (could be ms or minutes).

### Why eventual consistency
- Strong consistency requires quorum round-trips → slow.
- In a network partition, strong consistency = unavailability (CAP).
- Many use cases tolerate staleness (feeds, likes, counts).

### Examples
- **DNS**: updates propagate slowly, eventually.
- **Social feed**: new post appears seconds later for some users.
- **Like counts**: not perfectly real-time.
- **Shopping cart**: converges eventually across devices.
- **Cassandra, DynamoDB** (in eventual mode).

### Mechanisms
- **Async replication**: writes propagate in background.
- **Read repair**: on read, detect stale replicas, repair.
- **Anti-entropy**: periodic full-state sync (Merkle trees in Cassandra).
- **Gossip**: spread updates peer-to-peer.
- **Conflict resolution**: LWW, vector clocks, CRDTs.

### Trade-offs
- ✅ **High availability** (works during partitions).
- ✅ **Low latency** (no quorum round-trip).
- ✅ **Scales well**.
- ❌ **Stale reads**.
- ❌ **Conflict resolution complexity**.
- ❌ **Hard to reason about** ("is this the latest?").

### When it's OK
- **Feeds, timelines** (a few seconds stale is fine).
- **Counts** (likes, views).
- **Recommendations** (continuously recomputed).
- **Cache invalidation** (eventually consistent).

### When it's NOT OK
- **Banking** (must see the latest balance).
- **Inventory** (must not oversell).
- **Authentication** (must see revoked tokens immediately).

### Read-your-writes consistency
A common middle ground: a user always sees their own writes, even if others don't yet.
Achieved via sticky sessions, read-from-primary for X seconds after write.

### Key takeaway
Eventual consistency trades staleness for availability + latency. Use it for **tolerant**
workloads (feeds, counts, recommendations). Don't use it for transactional correctness (banking,
inventory).
