# Read Replicas

> **Category:** Scaling

---

**Read Replicas** are copy instances of a primary database designed specifically to serve read-only queries. Writes are directed exclusively to the primary node, which asynchronously or synchronously propagates state updates to all read replicas, distributing read traffic and offloading the primary database.

### System architecture

```
                     +-----------------------------------+
                     |         Application Tier          |
                     +-----------------------------------+
                         /             |             \
               Writes   /         Reads|              \ Reads
                       v               v               v
            +--------------+   +--------------+   +--------------+
            | Primary DB   |   | Read Replica |   | Read Replica |
            |  (Write/Read)|   |   (Node 1)   |   |   (Node 2)   |
            +--------------+   +--------------+   +--------------+
                   |                   ^                   ^
                   |  Async / Sync     |                   |
                   +--- Replication ---+-------------------+
```

### Replication mechanisms

1. **Asynchronous Replication**: Primary acknowledges writes immediately after writing locally without waiting for replicas. Replicas fetch updates via transaction logs (WAL). *High performance, but risks replication lag and stale reads.*
2. **Synchronous Replication**: Primary waits for at least one replica to commit the write before returning success to the client. *Guarantees consistency, but write latency equals the slowest replica's network round-trip.*
3. **Semi-Synchronous Replication**: Primary waits for at least one replica to acknowledge log receipt (without full disk commit) before responding.

### Read replica configuration & routing

| Architecture Component | Description | Trade-Off / Risk |
| :--- | :--- | :--- |
| **Read/Write Router** | Middleware (ProxySQL, PgBouncer) routing SQL statements by command (`SELECT` vs `INSERT/UPDATE`) | Single point of failure unless load balanced |
| **Replication Lag** | Delay between primary commit and replica update | Stale reads (user updates profile, refreshes, sees old info) |
| **Failover / Promotion** | Promoting replica to primary if primary fails | Risk of split-brain if health checks misfire |
| **Geographic Distribution** | Placing read replicas near global users | Cross-region replication latency and ingress costs |

### Mitigating replication lag issues

- **Read-Your-Own-Writes Consistency**: Route reads from a user who just modified data to the primary node for a fixed window (e.g., 5 seconds) before switching back to replicas.
- **Monotonic Read Consistency**: Ensure a client's queries always hit the same replica so they never observe time move backward.
- **Replica Health Checks**: Automatically remove replicas from the load balancing pool if their replication lag exceeds acceptable limits (e.g., > 2 seconds).

### Key takeaway

Read replicas provide an effective mechanism for scaling read-heavy applications. To handle eventual consistency and stale reads, implement read-your-own-writes mechanisms and active replica lag monitoring.
