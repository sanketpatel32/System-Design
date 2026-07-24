# Distributed System Basics

> **Category:** Distributed Systems

---

A Distributed System is a collection of **autonomous, networked computing nodes** that communicate via message passing, coordinating actions to appear to end users as a single coherent system.

### Distributed Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                              Global Load Balancer                                 |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                | Network Latency / Non-deterministic Delays |
                v                                                   v
    +-----------------------+                           +-----------------------+
    | Service Node A        | <--- Consensus / RPC ---> | Service Node B        |
    | Independent Clock A   |                           | Independent Clock B   |
    +-----------------------+                           +-----------------------+
                |                                                   |
                +-------------------------+-------------------------+
                                          v
                                +-------------------+
                                | Shared NoSQL / DB |
                                +-------------------+
```

### Core Characteristics & Guarantees

- **No Shared Memory**: Nodes communicate exclusively over unreliable physical network links.
- **Independent Failure Domains**: Individual machines fail independently while the overall cluster remains operational.
- **Lack of Global Physical Clock**: Physical time varies across machines (clock skew), requiring logical clocks (Lamport, Vector Clocks) for event ordering.

### Distributed Systems Trade-off Matrix

| Challenge Domain | Fundamental Issue | Engineering Solutions |
| :--- | :--- | :--- |
| **Network Partitions** | Packets dropped, delayed, or duplicated | Retries, Backpressure, Idempotency keys |
| **Consistency vs Availability**| Cannot guarantee both during partition (CAP) | AP (Eventual) vs CP (Strong Consensus) |
| **Partial Failure** | System operates in degraded partial states | Circuit Breakers, Bulkheads, Health Checks |
| **Time & Ordering** | Physical clocks drift across servers | Vector Clocks, TrueTime (Atomic + GPS), NTP |

### Key Trade-offs

- ✅ **Horizontal Scalability**: Add commodity hardware nodes to scale compute and storage linearly.
- ✅ **Fault Tolerance**: Redundancy ensures system survives hardware, rack, or datacenter outages.
- ❌ **Operational Complexity**: Debugging distributed state, network partitions, and race conditions is significantly harder than single-node execution.

### Key takeaway

Distributed systems trade single-node simplicity for **infinite scalability and high availability**, managing unreliable networks through consensus protocols, logical clocks, and fault-tolerant replication.
