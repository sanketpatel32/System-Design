# Read Repair

> **Category:** Distributed Systems

---

Read repair is an **active background data reconciliation mechanism** in eventually consistent distributed databases (such as Apache Cassandra and Amazon Dynamo). When a client reads data from a quorum of replicas, the system compares the version signatures of all returned records. If a stale replica is detected, the database updates the stale node asynchronously while returning the newest data to the client.

### Read Repair Step-by-Step Architecture

Read repair detects divergent data versions across replicas during client read operations and automatically heals stale nodes.

```
+--------------+        1. Issue Read Request (R = 3)         +--------------------+
| Client App   | -------------------------------------------> | Coordinator Node   |
+--------------+                                              +--------------------+
                                                                 /      |                                             2. Fetch Data & Digests   /       |                                                                       v        v         v
                                                        +--------+  +--------+  +--------+
                                                        | Node A |  | Node B |  | Node C |
                                                        | (v2)   |  | (v2)   |  | (v1)   |
                                                        +--------+  +--------+  +--------+
                                                               \        |        /
                                             3. Compare Values  \       |       /
                                                                 v      v      v
                                                     +------------------------------------+
                                                     | Coordinator detects Node C is      |
                                                     | STALE (v1 < v2)!                   |
                                                     +------------------------------------+
                                                        /                                                         4. Return Newest (v2) Data  /                                \ 5. Async Read Repair Write
                                                      v                                  v
                                             +------------------+              +------------------+
                                             | Client Application|              | Node C (Healed!) |
                                             +------------------+              +------------------+
```

### Read Repair Execution Modes Matrix

| Execution Mode | Mechanism | Read Latency Impact | Network Overhead | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Blocking Read Repair** | Coordinator waits for stale nodes to write repair before returning to client | High (Adds write RTT to read latency) | Moderate | Mission-critical read paths |
| **Async Read Repair** | Coordinator returns data to client immediately and fires background repair tasks | Minimal (Zero read latency penalty) | Moderate | Default production mode (Cassandra) |
| **Probabilistic Read Repair**| Triggers read repair check on a configurable percentage of reads (e.g. 10%) | Low | Controlled | High-throughput tables |

### Read Repair vs Background Anti-Entropy

- **Read Repair**: Triggered dynamically during active read traffic. Heals hot, frequently accessed keys quickly. Stale keys that are never read remain unrepaired.
- **Background Anti-Entropy (Merkle Trees)**: Runs scheduled background scans comparing hash trees across all nodes. Heals cold, unread keys.

### Key Trade-offs & Production Tuning

- ✅ **Self-Healing Data Store**: Keeps active data consistent across replicas automatically without manual database administrator intervention.
- ✅ **Zero Downtime Reconciliation**: Operates transparently alongside production application traffic.
- ❌ **Read Latency Spikes**: If configured as blocking read repair, slow or lagging nodes can cause temporary read latency spikes.
### Production Async Read Repair Code Pattern (Cassandra Style)

```
+----------------------------------------------------------------------------------------------------+
| Read Repair Background Worker                                                                      |
|                                                                                                    |
|  1. Coordinator returns latest version (v2) to Client immediately                                  |
|  2. Async thread fires background write to stale Replica C (v1 -> v2)                              |
|  3. Replica C updates local SSTable and responds ACK                                               |
|  4. Repair complete! Next read from Replica C returns updated v2 data                              |
+----------------------------------------------------------------------------------------------------+
```

### Tuning Read Repair in Production

- **Cassandra Table Settings**: `ALTER TABLE users WITH read_repair = 'BLOCKING';` or `read_repair = 'NONE';` (Relying exclusively on scheduled background Anti-Entropy Merkle Tree repairs).

### Key takeaway

Read repair is a **self-healing consistency mechanism that detects and updates stale database replicas during read operations**, ensuring hot data converges quickly without downtime.
