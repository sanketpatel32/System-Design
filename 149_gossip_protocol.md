# Gossip Protocol

> **Category:** Distributed Systems

---

Gossip (epidemic protocol) = **nodes periodically exchange state info with random peers**,
spreading information like a rumor through a population.

### How it works
```
Every T seconds:
  pick K random peers
  exchange state (recent updates)
Updates spread exponentially:
  t=1: 1 node knows
  t=2: ~K nodes know
  t=3: ~K^2 nodes know
  ...
  t=log_K(N): all N nodes know
```

### Why gossip
- **Decentralized** — no leader.
- **Scalable** — O(log N) propagation.
- **Robust** — survives node failures.
- **Simple** — easy to implement.

### Use cases
- **Membership**: who's in the cluster?
- **Failure detection**: who's dead?
- **State propagation**: schema changes, config.
- **Topology**: which node owns which shard.

### Real-world
- **Cassandra** uses gossip for cluster membership + failure detection.
- **Consul / Serf** (SWIM protocol).
- **DynamoDB**.
- **Bitcoin** network.

### Failure detection
- Each node gossips about who it has heard from recently.
- If a node hasn't been heard from in T seconds → suspected.
- After a quarantine period → marked dead.

### Variants
- **Push**: sender initiates exchange.
- **Pull**: receiver asks.
- **Push-pull**: both (fastest).
- **Anti-entropy**: periodic full-state sync (slower, catches missed updates).

### Trade-offs
- ✅ Scalable, decentralized, fault-tolerant.
- ✅ Eventually consistent (good for membership).
- ❌ Eventual convergence (not for strong consistency).
- ❌ Bandwidth usage (grows with cluster size).
- ❌ Detecting failures takes seconds (not ms).

### Key takeaway
Gossip is the **decentralized way** to spread cluster state. Used for membership, failure
detection, and topology in distributed DBs (Cassandra, Consul). Not for strong consistency —
purely eventual.
