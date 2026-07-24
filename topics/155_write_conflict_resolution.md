# Write Conflict Resolution

> **Category:** Distributed Systems

---

Write Conflict Resolution is the set of strategies used in multi-leader or leaderless distributed databases to **reconcile concurrent modifications** made to the same record across different replicas.

### Concurrent Write Conflict Scenario

```
                    +--------------------+
                    | Initial State (v0) |
                    +--------------------+
                              |
         +--------------------+--------------------+
         | Concurrent Write A                      | Concurrent Write B
         v                                         v
+--------------------+                    +--------------------+
| Node 1: "Alice"    |                    | Node 2: "Bob"      |
| Vector: [1, 0]     |                    | Vector: [0, 1]     |
+--------------------+                    +--------------------+
         |                                         |
         +--------------------+--------------------+
                              v
                   +----------------------+
                   | Conflict Detected!   |
                   | Neither vector dominates|
                   +----------------------+
```

### Conflict Resolution Strategies Matrix

| Strategy | Mechanism | Data Loss Risk | Resolution Location | Example Systems |
| :--- | :--- | :--- | :--- | :--- |
| **Last-Write-Wins (LWW)** | Overwrites based on highest physical timestamp | High (Clock skew drops valid writes)| Database Engine | Apache Cassandra, DynamoDB |
| **Vector Clocks / Sibling Merge**| Retains concurrent siblings for app merge | Zero | Client / Application Code | Riak, Amazon Dynamo |
| **CRDTs (Conflict-free Replicated Data Types)**| Math commutativity (PN-Counters, LWW-Element-Set) | Zero | Database Engine / Automata | Redis Enterprise, Riak KV |
| **Custom Application Resolvers**| Executes custom domain merge script | Zero | Application Middleware | Figma, Google Docs (OT) |

### CRDT Types & Behavior

- **State-based CRDTs (CvRDT)**: Replicas exchange full state arrays and merge them monotonically (e.g., set union).
- **Operation-based CRDTs (CmRDT)**: Replicas transmit commutative operations (e.g., increment/decrement) over reliable networks.

### Key takeaway

Resolve write conflicts using **CRDTs or application-level merges** whenever possible; avoid Last-Write-Wins (LWW) if data loss caused by clock drift is unacceptable.
