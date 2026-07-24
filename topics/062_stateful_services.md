# Stateful Services

> **Category:** Scaling

---

A **stateful service** retains client context, session state, or operational data locally across multiple requests. Subsequent interactions depend on data stored from previous calls on the specific server instance. Examples include databases, in-memory caches, messaging brokers, game servers, and WebSocket connections.

### System architecture

```
                     +-----------------------------------+
                     |    L7 LB (Sticky / Hash Router)   |
                     +-----------------------------------+
                         /             |             \
           Session A    /    Session B |              \ Session C
                       v               v               v
            +--------------+   +--------------+   +--------------+
            | Stateful App |   | Stateful App |   | Stateful App |
            |   (Node 1)   |   |   (Node 2)   |   |   (Node 3)   |
            | [Local Mem/  |   | [Local Mem/  |   | [Local Mem/  |
            |  Disk State] |   |  Disk State] |   |  Disk State] |
            +--------------+   +--------------+   +--------------+
                   |                   |                   |
                   +===================+===================+
                               Replication / Sync
```

### Core mechanics & routing challenges

Managing stateful applications requires explicit design considerations for session routing, data replication, and node failure management:

1. **Sticky Sessions (Session Affinity)**: Load balancers inspect cookies or client IP addresses to route requests from a specific user consistently to the exact same backend instance holding their state.
2. **Local Storage & Persistence**: Stateful nodes maintain write-ahead logs (WAL), local SSD indexes, or in-memory state tables. Data must be flushed to persistent disks asynchronously or synchronously.
3. **Consensus & Clustering**: Stateful nodes communicate via cluster protocols (Raft, Paxos, Gossip) to maintain data consistency, handle leader election, and track cluster topology.

### Stateful vs Stateless Comparison

| Feature | Stateful Services | Stateless Services |
| :--- | :--- | :--- |
| **State Location** | Local RAM, NVMe SSD, or local process memory | External DB, Cache, or Object Storage |
| **Routing Requirement** | Requires Sticky Sessions or Consistent Hashing | Any node can handle any incoming request |
| **Scaling Complexity** | High — requires data rebalancing, warming, or replication | Low — spawn or kill compute instances instantly |
| **Node Failure Impact** | Local data loss risk unless replicated across peers | Zero impact; traffic re-routed instantly |
| **Primary Use Cases** | Databases (Postgres, Cassandra), Caching (Redis), WebSockets | REST/gRPC APIs, Web Frontends, Microservices |

### Architectural strategies for stateful services

- **Write-Ahead Logging (WAL)**: Record every mutation to disk before altering in-memory state to survive abrupt node crashes.
- **Replication Pairs**: Maintain primary-replica pairs to ensure state is duplicated across fault domains.
- **Graceful Termination & Drain**: On shutdown, a stateful node must flush buffer pools, hand off master leadership, and migrate active connections before stopping.

### Key takeaway

Stateful services are necessary for data persistence, real-time messaging, and high-performance caching. However, statefulness introduces operational complexity around routing affinity, data replication, and failover recovery, requiring strict cluster coordination mechanisms.
