# Clock Skew

> **Category:** Distributed Systems

---

Clock skew = **different machines have slightly different clock readings.** A fundamental
distributed systems problem.

### Why clocks differ
- Hardware clocks drift (quartz crystals imperfect).
- NTP syncs periodically but not constantly.
- Network delays make sync imprecise.
- Leap seconds, timezone changes.

### Magnitude
- NTP can keep clocks within **tens of milliseconds**.
- Without NTP, drift can be **seconds per day**.
- In datacenters, skew is usually < 100ms.

### Problems caused by clock skew
- **Last-Write-Wins** can pick the wrong winner (clock lie).
- **TTLs** expire at different times on different nodes.
- **Ordering events** across nodes is unreliable.
- **Caching** can serve stale data after a "future" expiry.
- **Scheduled jobs** can fire twice or skip.

### Solutions

#### 1. NTP
- Sync clocks to time servers.
- Good for general use; not perfect.

#### 2. Logical clocks
- Lamport clocks, vector clocks.
- Don't rely on wall-clock time; track causality.

#### 3. TrueTime (Google Spanner)
- API returns an **uncertainty interval** [earliest, latest].
- Wait out the uncertainty before committing.
- Atomic clocks + GPS in datacenters → tight bounds.

#### 4. Hybrid Logical Clocks (HLC)
- Combine wall-clock + logical counter.
- Mostly physical, falls back to logical on ties.

#### 5. Avoid wall-clock for correctness
- Don't use timestamps for ordering decisions.
- Use monotonic counters (sequence numbers, log positions).

### Real-world
- **Cassandra**: LWW conflicts can pick wrong winner if clocks skew.
- **Spanner**: TrueTime gives bounded clock uncertainty → external consistency.
- **Multi-region systems**: skew bigger across regions.

### Key takeaway
Don't trust wall-clock timestamps for correctness in distributed systems. Use **logical clocks**
(vector, Lamport), **HLC**, or **TrueTime** (if available). Save wall-clock for telemetry and
approximate ordering.
