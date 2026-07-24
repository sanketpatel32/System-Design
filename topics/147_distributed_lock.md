# Distributed Lock

> **Category:** Distributed Systems

---

A Distributed Lock is a synchronization mechanism that guarantees **mutual exclusion across multiple independent node instances**, ensuring only one process can access a shared resource at any given time.

### Distributed Lock Lifecycle & Fencing Tokens

```
+----------+      1. Acquire Lock (TTL=10s)       +-----------------------+      Generates Token: 42     +-------------------+
| Worker A | -----------------------------------> | Distributed Lock Manager| --------------------------> | Lock Key (Active)|
+----------+                                      | (Redis / etcd)        |                             +-------------------+
     |                                            +-----------------------+                                       |
     | 2. Execute DB Write with Fencing Token: 42                                                                 |
     +------------------------------------------------------------------------------------------------------------+
     |                                                                                                            v
     | (GC Pause / Network Lag > 10s -> Lock Expires!)                                                +-------------------+
     |                                                                                                | Target Database   |
     | 3. Late Write Attempt (Token: 42)                                                              | (State DB)        |
     v                                                                                                +-------------------+
+----------+      Rejection! DB accepts only token > 42                                                           |
| Worker B | -----------------------------------------------------------------------------------------------------+
  Acquires Lock (Token: 43)
```

### Distributed Lock Implementations

| Implementation | Engine | Lock Primitive | Pros | Cons / Risks |
| :--- | :--- | :--- | :--- | :--- |
| **etcd / ZooKeeper** | Strongly Consistent Consensus | Ephemeral Sequential Nodes / Leases | Highly Reliable, Auto-cleanup on disconnect | Higher Latency (Consensus overhead) |
| **Redis Redlock** | Multi-node In-Memory Cache | `SET key value NX PX 30000` across 5 nodes | Fast, Low Latency | Clock drift vulnerabilities |
| **DB Row Lock** | Relational DB | `SELECT ... FOR UPDATE` | Simple, No extra infrastructure | DB Lock Contention |

### Key Engineering Guardrails

- **Fencing Tokens**: Always pass a monotonic counter with lock acquisitions. Storage resources check and reject stale lower-token numbers to prevent race conditions caused by process pauses (e.g., Garbage Collection pauses).
- **Atomic Release via Lua**: Releasing a Redis lock must verify token ownership inside an atomic Lua script to avoid deleting another worker's new lock.

### Key takeaway

Use distributed locks for **mutual exclusion**, protecting writes with short TTLs and **monotonic fencing tokens** to prevent state corruption during process pauses.
