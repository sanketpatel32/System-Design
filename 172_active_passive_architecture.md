# Active-Passive Architecture

> **Category:** Reliability and Fault Tolerance

---

Active-passive = **one region/instance serves traffic (active), another stands ready
(passive)**. The passive takes over on failure.

### Topology
```
[Region 1 - Active]    [Region 2 - Passive]
        |                      ^
        | replicate data       |
        +----------------------+
                                |
   On failure: DNS failover ----+
```

### How failover works
1. Health checks detect Region 1 is down.
2. DNS records updated to point to Region 2.
3. Region 2 promoted to active.
4. Traffic flows to Region 2.

### Trade-offs
- ✅ **Simple** compared to active-active.
- ✅ **No data conflicts** (only one writer).
- ✅ Cheaper than full active-active (passive can be smaller).
- ❌ **Wasted capacity** (passive idle).
- ❌ **Failover takes time** (DNS TTL, data promotion).
- ❌ **Data loss** with async replication (RPO > 0).

### RPO and RTO
- **RPO**: how much data is lost (replication lag at moment of failure).
- **RTO**: how long until service is back (DNS TTL + promotion).
- Typical: RPO seconds to minutes, RTO 5-30 minutes.

### Replication
- **Async** (most common): low impact on writes, but RPO > 0.
- **Synchronous**: RPO = 0, but adds write latency.

### When to use
- DR strategy where cost matters.
- When active-active conflicts are too hard.
- For stateful systems that can't easily multi-write.

### Variations
- **Pilot light**: passive is minimal (just data); scale up on failover.
- **Warm standby**: passive is fully deployed but at smaller scale.

### Testing
- Failover must be drilled regularly.
- Run game days: actually switch traffic to passive.
- Measure RTO.

### Key takeaway
Active-passive is the **simplest multi-region DR strategy**. Passive replicates data, takes over
on failure. Trade-offs: wasted capacity, failover delay. Acceptable RTO/RPO for many
applications.
