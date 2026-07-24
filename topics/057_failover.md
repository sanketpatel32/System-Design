# Failover

> **Category:** Load Balancing

---

**Failover** is an automated operational strategy that transfers control and workload from a primary failed system component (server, database master, load balancer, or entire data center) to a redundant standby or secondary component, ensuring continuous service availability.

### Failover Architecture Topology

```
+-------------------------------------------------------------------------+
|                  ACTIVE-PASSIVE FAILOVER TOPOLOGY                       |
+-------------------------------------------------------------------------+

  [ DNS Anycast / Floating Virtual IP (VIP) ]
                      |
        +-------------+-------------+
        | (Active Traffic Flow)     | (Standby Heartbeat Monitor)
        v                           v
  +--------------------+   Keepalived   +--------------------+
  | Primary Node A     |===============>| Standby Node B     |
  | (Active Master)    |   Heartbeat    | (Passive Passive)  |
  +--------------------+                +--------------------+
  [ Node A Crashes ] -----------------> [ Node B Promoted to Active ]
                                        [ Floating VIP re-assigned to B ]
```

### Failover Strategies Comparison

| Failover Strategy | Mechanism | RTO (Recovery Time) | RPO (Data Loss Risk) | Cost Efficiency |
| :--- | :--- | :--- | :--- | :--- |
| **Active-Passive (Cold Standby)** | Standby node turned off; booted during primary crash. | High (Minutes to hours) | Medium (Depending on backup age) | High (No active server costs) |
| **Active-Passive (Warm Standby)** | Standby node running & receiving DB replication; handles traffic only on failure. | Low (Seconds to minutes) | Low (Dependent on async sync lag) | Medium (2x infrastructure cost) |
| **Active-Active (Multi-Primary)**| All nodes process traffic concurrently; remaining nodes absorb load if one fails. | Near-Zero (Instantaneous) | Zero (If synchronous consensus used) | Highest (Full capacity utilization) |
| **DNS Failover** | Health monitor updates DNS A-records to secondary IP. | Medium (Bounded by DNS TTL ~60s) | Medium | High |

### Split-Brain Scenario & Consensus Mitigation
In multi-node failover setups, if network communication between primary and secondary nodes is severed (partition), both nodes may assume the other is dead and promote themselves to Primary simultaneously. This causes **Split-Brain state corruption**.

- **Mitigation**: Use quorum consensus algorithms (**Raft, Paxos**) requiring an odd number of nodes (minimum 3 nodes) to form a majority vote ($Q > N/2$) before promoting a new primary leader.

### Key takeaway

Failover prevents downtime by automatically promoting standby resources when primary components fail. Prevent **split-brain data corruption** during failover by enforcing quorum consensus (Raft/Paxos) across an odd number of nodes.
