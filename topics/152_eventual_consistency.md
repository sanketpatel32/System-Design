# Eventual Consistency

> **Category:** Distributed Systems

---

Eventual Consistency is a weak consistency model guaranteeing that if no new updates are made to a data item, **all replicas will eventually converge** and return identical values when queried.

### Eventual Replication Convergence Sequence

```
+----------+      1. Write Update (v=2)      +------------------+
| Client   | ------------------------------> | Master Node      |
+----------+                                 +------------------+
     |                                                |
     | 2. Read Request (Receives Old v=1)             | 3. Async Replication
     v                                                v
+------------------+                         +------------------+
| Replica Node 2   |                         | Replica Node 3   |
| (Stale State)    |                         | (Eventual v=2)   |
+------------------+                         +------------------+
```

### Eventual Consistency Spectrum Matrix

| Consistency Flavor | Guarantee | Implementation |
| :--- | :--- | :--- |
| **Basic Eventual** | Replicas converge at an unspecified future time | Async Background Replication |
| **Read-Your-Writes** | A user always reads their own latest updates | Sticky Sessions / Routing to Primary |
| **Monotonic Reads** | Once a user reads a value, they never see an older value | Client-level offset tracking |
| **Causal Consistency**| Operations that are causally related are seen in order | Vector Clocks |

### System Trade-offs

- ✅ **Maximum Availability & Low Latency**: Reads and writes complete against any local node without waiting for cross-network agreement.
- ❌ **Temporary Stale Reads**: Applications must handle stale data and write conflicts gracefully.

### Key takeaway

Eventual consistency maximizes **availability and low-latency writes** by replicating updates asynchronously, accepting temporary read staleness in exchange for performance.
