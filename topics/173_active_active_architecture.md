# Active-Active Architecture

> **Category:** Reliability and Fault Tolerance

---

Active-Active Architecture is a deployment model where **two or more node clusters or regions simultaneously process active user traffic**, maximizing resource utilization and offering sub-second failure resilience.

### Active-Active Multi-Master Architecture

```
+-----------------------------------------------------------------------------------+
|                        Global Anycast / Latency Load Balancer                     |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                | 50% User Traffic                                  | 50% User Traffic
                v                                                   v
+------------------------------------+                    +------------------------------------+
| Active Region A (US)               |                    | Active Region B (EU)               |
| - Serves Live Reads & Writes       |                    | - Serves Live Reads & Writes       |
+------------------------------------+                    +------------------------------------+
                |                                                   |
                +<--- Bidirectional Async Data Replication -------->+
                      (CRDTs / Conflict Resolution Engines)
```

### Active-Active vs Active-Passive

| Feature Dimension | Active-Active Architecture | Active-Passive Architecture |
| :--- | :--- | :--- |
| **Capacity Utilization** | 100% (All nodes actively serve traffic) | ~50% (Standby nodes sit idle) |
| **Failover Delay** | Instantaneous (Zero DNS change delay) | Seconds to minutes (RTO lag) |
| **Data Synchronization**| Complex (Multi-master writes / conflicts) | Simple (Single-master stream) |
| **Implementation Cost**| High (Requires CRDTs or sharded routing) | Medium |

### Architectural Design Strategies

- **Geographic User Pinning**: Pin user sessions to their home region (e.g. EU users routed to EU cluster) so 99% of updates occur locally, eliminating multi-master write conflicts.
- **Asynchronous Conflict Resolution**: Use Conflict-free Replicated Data Types (CRDTs) or Last-Write-Wins timestamps for global table updates.

### Key takeaway

Active-Active architectures provide **maximum throughput and zero-downtime failover** by running concurrent live clusters, using geographic user pinning to prevent multi-master write conflicts.
