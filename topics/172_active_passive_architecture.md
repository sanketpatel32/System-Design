# Active-Passive Architecture

> **Category:** Reliability and Fault Tolerance

---

Active-Passive Architecture is a high-availability deployment model where **one primary node/region processes 100% of live traffic**, while one or more passive standby instances remain idle or synchronized, ready to take over during failover.

### Active-Passive Hot Standby Sequence

```
                                  +-----------------------+
                                  | Global DNS / Router   |
                                  +-----------------------+
                                    /                              1. Live Traffic (100%)  /                     \ 2. Standby Route (0% Traffic)
                                  v                       v
                      +-------------------+       +-------------------+
                      | Active Node       |       | Passive Standby   |
                      | (Processing Req)  |       | (Warm Replica)    |
                      +-------------------+       +-------------------+
                                |                           ^
                                +--- Async DB Replication --+
```

### Active-Passive Variants Matrix

| Variant | Standby State | Failover Time (RTO) | Cost Overhead | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Cold Standby** | Instance powered off; turned on during disaster | 15 - 60 Minutes | Lowest | Non-critical internal batch apps |
| **Warm Standby** | Instance running at reduced capacity | 1 - 5 Minutes | Medium | Mid-tier web applications |
| **Hot Standby** | Fully provisioned running replica synced in real time| Sub-Second to Seconds | High | Relational DB primary/replica setups |

### System Trade-offs

- ✅ **Simple Conceptual Model**: Eliminates write-conflict resolution since all updates occur on a single active primary node.
- ❌ **Resource Underutilization**: Passive standby compute resources sit idle during normal operating conditions.

### Key takeaway

Active-Passive architectures deliver **simple, conflict-free high availability** by concentrating writes on a primary node while maintaining warm standby instances for rapid failover.
