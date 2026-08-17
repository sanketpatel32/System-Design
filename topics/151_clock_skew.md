# Clock Skew

> **Category:** Distributed Systems

---

Clock skew is the difference in **time displayed by physical clocks on different nodes** across a distributed network. Because quartz oscillators in server motherboards drift due to temperature and hardware variance, distributed systems cannot rely on physical timestamps alone to determine event ordering or transactional consistency.

### Clock Skew Problem Architecture

Physical clock drift causes Node B to register a write event as occurring "in the past" relative to Node A, causing Last-Write-Wins (LWW) to silently drop newer updates.

```
Node A Physical Clock: 12:00:05.100                    Node B Physical Clock: 12:00:04.900 (Drifts -200ms)
+------------------------------------+                +------------------------------------+
|  Event 1: Write User Email         |                |  Event 2: Update User Email        |
|  Timestamp: 12:00:05.100           |                |  Timestamp: 12:00:04.900           |
+------------------------------------+                +------------------------------------+
                   \                                     /
                    \                                   /
                     v                                 v
+----------------------------------------------------------------------------------------------------+
| Distributed Database Engine (Last-Write-Wins - LWW)                                                |
| - Evaluates Event 1 (12:00:05.100) vs Event 2 (12:00:04.900)                                       |
| - ERROR: Event 2 (which occurred LATER in real time) is discarded because its clock lagged behind! |
+----------------------------------------------------------------------------------------------------+
```

### Clock Synchronization Technologies Matrix

| Solution | Protocol / Mechanism | Typical Skew Bound | Hardware Required | Used In Production |
| :--- | :--- | :--- | :--- | :--- |
| **Standard NTP** | Network Time Protocol over UDP | 10ms to 100ms | Standard Commodity Hardware | Standard Linux Servers |
| **PTP (IEEE 1588)** | Precision Time Protocol | Sub-microsecond (<1µs) | Specialized Network Hardware / NICs | Financial High-Frequency Trading |
| **Google TrueTime** | Atomic Clocks + GPS Receivers | Bounded ε ≈ 1ms to 7ms | Specialized Datacenter Hardware | Google Spanner |
| **Logical Clocks** | Lamport Timestamps / Vector Clocks | Zero dependence on physical time | None (Software Counter Array) | Cassandra, Riak, DynamoDB |

### Impact of Clock Skew on System Design

1. **Last-Write-Wins (LWW) Data Loss**: In Cassandra/ScyllaDB, writes with lagging physical timestamps are silently overwritten by stale writes with leading physical timestamps.
2. **Security Token Expiration**: OAuth/JWT tokens created on a server with a leading clock might be rejected as "not yet valid" (`nbf` claim) by authorization servers with lagging clocks.
3. **Lease Overlaps**: Distributed locks relying on physical TTL timers can expire prematurely, violating mutual exclusion guarantees.

### Key Trade-offs & Engineering Mitigations

- ✅ **Monotonic Clocks (`clock_gettime(CLOCK_MONOTONIC)`)**: Use monotonic timers rather than wall-clock time for measuring intervals and timeouts locally.
- ✅ **Hybrid Logical Clocks (HLC)**: Combine physical NTP timestamps with logical counters to bound clock drift while maintaining event causality.
- ❌ **Physical Clock Delusions**: Never rely on `System.currentTimeMillis()` for distributed transaction ordering unless using bounded hardware time like Google TrueTime.
### Hybrid Logical Clock (HLC) Architecture

To eliminate vulnerability to physical clock skew while maintaining human-readable timestamps, systems like CockroachDB and MongoDB use **Hybrid Logical Clocks (HLC)**.

```
Hybrid Logical Clock Tuple: (Physical_Time, Logical_Counter)

Event 1 on Node A: (Physical: 1000ms, Counter: 0)
Event 2 on Node A: (Physical: 1000ms, Counter: 1)  <-- Physical time hasn't changed; counter increments!
Event 3 on Node B (Receives Msg): (Physical: 1002ms, Counter: 0) <-- Advances physical component!

Guarantee: HLC timestamps are strictly monotonic and always close to physical time!
```

### Production Guidance for Clock Skew Mitigation

- **Configure NTP Monitoring**: Set up automated alerts if server NTP clock offset exceeds 50 milliseconds (`chronyc tracking`).
- **Use TrueTime / Spanner Bounds**: If building multi-datacenter transactional RDBMS, use hardware atomic clocks to bound uncertainty (ε).

### Key takeaway

Physical clocks drift unpredictably. Systems requiring strict event ordering must use **Logical Clocks (Vector/Lamport) or Bounded Time APIs (TrueTime/HLC)** rather than bare wall-clock timestamps.
