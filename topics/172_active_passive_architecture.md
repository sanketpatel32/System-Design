# Active-Passive Architecture

> **Category:** Reliability and Fault Tolerance

---

Active-Passive (or Primary-Standby) is a multi-node redundancy pattern where **one active node or datacenter handles 100% of live application traffic**, while one or more passive standby nodes remain on idle standby, continuously synchronizing state. If the active node fails, traffic is failed over to the passive node.

### Active-Passive System Architecture & Failover

The standby node receives continuous database log replication from the primary, ready to assume traffic if health checks detect a primary failure.

```
Normal Active Operating State:
+---------------+     1. Live Traffic (100%)     +-------------------------+
| Client App /  | -----------------------------> | Primary Active Node     |
| Load Balancer |                                | (App + Write RDBMS)     |
+---------------+                                +-------------------------+
                                                              |
                                            2. Async WAL      |
                                               Replication    v
+---------------+                                +-------------------------+
| Failover DNS  | -----------------------------> | Passive Standby Node    |
| Health Check  |  (Idle / Probe Health Only)    | (Read Replica / Standby)|
+---------------+                                +-------------------------+

Failover Triggered (Primary Crashes):
1. Health Check detects Primary timeout -> 2. Promotes Standby to Primary -> 3. DNS reroutes 100% traffic to Standby!
```

### Active-Passive Failover Strategies Comparison Matrix

| Failover Mode | Trigger Mechanism | Failover Time (RTO) | Risk Profile |
| :--- | :--- | :--- | :--- |
| **Automated Failover** | Health Check Orchestrator (e.g. Patroni, AWS RDS Multi-AZ) | 30 to 60 seconds | Risk of false-positive failover (Split-Brain) if health probe glitches |
| **Manual Failover** | Engineer executes runbook script during outage | 5 to 30 minutes | Safe against split-brain, but incurs higher downtime (RTO) |
| **Warm Standby** | Standby compute instances scaled down to 20% | 3 to 10 minutes | Saves infrastructure cost, but requires time to scale up capacity |

### Key Mechanics & Data Synchronization

1. **Replication Methods**: Primary writes are synchronized to the passive standby using **Synchronous Replication** (Zero RPO, slower write performance) or **Asynchronous Replication** (Non-zero RPO, faster write performance).
2. **Fencing (STONITH - Shoot The Other Node In The Head)**: Ensures the failed primary node is forcefully powered off or network-isolated before promoting the standby to prevent concurrent split-brain writes.

### Key Trade-offs & Engineering Considerations

- ✅ **Simple Operational Model**: Single active writer avoids complex multi-master write conflict resolution.
- ✅ **Cost-Effective Standby**: Passive compute instances can run on smaller provisioned hardware until failover occurs.
- ❌ **Underutilized Standby Hardware**: Passive hardware sits idle during normal operations, burning infrastructure costs without serving live traffic.
### Patroni PostgreSQL Active-Passive Failover Architecture

```
+------------------+         Heartbeat Lease (TTL 10s)        +------------------+
| Primary DB Node  | ---------------------------------------> |  etcd Key-Value  |
+------------------+                                          |  Consensus Store |
        |                                                     +------------------+
   (Node Crashes!)                                                     ^
        |                                                              |
   Lease Expires! Standby Patroni Node executes candidacy search -----+
   Standby acquires Lease -> Promotes PostgreSQL to Primary Writer!
```

### Key takeaway

Active-Passive architecture provides **straightforward failover redundancy with a single active write node**, requiring automated health checks and strict fencing to prevent split-brain anomalies.
