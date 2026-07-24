# Quorum

> **Category:** Distributed Systems

---

A Quorum is the **minimum number of node votes required** to execute a valid read or write operation safely in a distributed system, preventing split-brain scenarios and guaranteeing consistency overlapping.

### Read/Write Quorum Overlap Architecture

```
+-----------------------------------------------------------------------------------+
|                             Distributed Database (N=5 Nodes)                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +--------------+    +--------------+    +--------------+                         |
|  | Node 1 (W)   |    | Node 2 (W)   |    | Node 3 (W+R) |  <--- Overlap Node!     |
|  +--------------+    +--------------+    +--------------+                         |
|  |<--------------- Write Quorum (W=3) ----------------->|                         |
|                                          |                                        |
|                                          | +--------------+    +--------------+   |
|                                          | | Node 4 (R)   |    | Node 5 (R)   |   |
|                                          | +--------------+    +--------------+   |
|                                          |<--- Read Quorum (R=3) ------------->|  |
+-----------------------------------------------------------------------------------+
```

### The Quorum Inequality Formula

To achieve strong consistency in a cluster of \(N\) replicas:

\[
W + R > N
\]

Where:
- \(N\) = Total Replica Factor (e.g., 5 nodes)
- \(W\) = Minimum Write Acknowledgment Quorum (e.g., 3 nodes)
- \(R\) = Minimum Read Acknowledgment Quorum (e.g., 3 nodes)

Since \(3 + 3 = 6 > 5\), at least one node in the Read Quorum is guaranteed to contain the latest timestamped write.

### Quorum Configuration Profiles

| Consistency Goal | Quorum Formula | Setup Example (N=3) | Performance Trade-off |
| :--- | :--- | :--- | :--- |
| **Strong Consistency (Balanced)** | \(W + R > N\) | \(W=2, R=2, N=3\) | Balanced read & write latency |
| **Fast Writes / Slow Reads** | \(W < N/2 + 1\) | \(W=1, R=3, N=3\) | Ultra-fast write ACKs, high read latency |
| **Fast Reads / Slow Writes** | \(R=1\) | \(W=3, R=1, N=3\) | Instant read lookups, slow multi-node writes |
| **Eventual Consistency** | \(W + R \le N\) | \(W=1, R=1, N=3\) | Low latency, potential stale reads |

### Key takeaway

Quorum rules balance system latency against consistency guarantees by ensuring that **write quorums and read quorums overlap on at least one up-to-date node** (\(W + R > N\)).
