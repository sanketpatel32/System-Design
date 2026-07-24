# Read Repair

> **Category:** Distributed Systems

---

Read Repair is an **anti-entropy background mechanism** in eventually consistent distributed databases where stale data replicas are detected and updated asynchronously during client read operations.

### Read Repair Sequence Diagram

```
+--------+            1. Read Request (Key=U101)            +--------------------+
| Client | ------------------------------------------------> | Coordinator Node   |
+--------+                                                   +--------------------+
    ^                                                          |        |        |
    | 4. Return Latest Value (v2) to Client                    | 2. Quorum Reads (R=3)
    +--------------------------------------------------+       |        |        |
                                                       v       v        v
                                                  +-------+ +-------+ +-------+
                                                  | Replica| |Replica| |Replica|
                                                  | A (v2) | | B (v2) | | C (v1)|  <-- Stale!
                                                  +-------+ +-------+ +-------+
                                                                         |
                                                                         | 3. Async Background Read Repair
                                                                         v (Overwrite v1 with v2)
                                                                    +-------+
                                                                    |Replica|
                                                                    | C (v2)|
                                                                    +-------+
```

### Repair Mechanics Comparison

| Mechanism | Execution Trigger | Latency Impact | Bandwidth Usage | Consistency Convergence |
| :--- | :--- | :--- | :--- | :--- |
| **Blocking Read Repair** | Active Client Read | High (Waits for repair ACK) | Low | Immediate for queried key |
| **Async Read Repair** | Active Client Read | Zero (Fired in background) | Low | Fast eventual convergence |
| **Active Anti-Entropy** | Periodic Background Sweeps | None on Client | High (Merkle tree hashes) | Background guarantee for cold data |

### Key System Benefits

- **Self-Healing State**: Cold or rarely-read data is restored to quorum consistency automatically whenever accessed.
- **Selective Network Bandwidth**: Avoids constant cluster-wide sync sweeps by fixing only requested stale keys.

### Key takeaway

Read Repair maintains **eventual consistency during normal read operations** by comparing replica timestamps and asynchronously updating stale nodes in the background.
