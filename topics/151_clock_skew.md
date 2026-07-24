# Clock Skew

> **Category:** Distributed Systems

---

Clock Skew is the **difference in physical time reported by quartz crystal clocks** across independent computer servers in a network due to manufacturing variations, temperature fluctuations, and NTP network jitter.

### Physical Clock Drift & Ordering Failure

```
Server 1 (Actual Time: 12:00:01) ---- Write Record A (Timestamp: 12:00:01) ----> Database
                                                                                 |
Server 2 (Clock Skew -5 sec: 11:59:56) -- Write Record B (Timestamp: 11:59:56) -> |
                                                                                 v
                                                      Last-Write-Wins (LWW) Policy Overwrites Record A
                                                      with Stale Record B due to Clock Skew!
```

### Clock Synchronization Technologies

| Mechanism | Protocol / Hardware | Typical Skew Bound | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **NTP (Network Time Protocol)**| Public Internet Servers | 10 ms - 100 ms | General Linux Server Logs |
| **PTP (Precision Time Protocol)**| Hardware Timestamping LAN | 1 µs - 10 µs | High-Frequency Financial Trading |
| **Google TrueTime API** | GPS Receivers + Atomic Clocks | < 1 ms - 7 ms | Spanner Distributed Transactions |

### Engineering Mitigation Strategies

- **Logical Clocks (Lamport / Vector Clocks)**: Replace physical time with logical sequence numbers for operation ordering.
- **Uncertainty Time Windows (TrueTime)**: Pause transaction commits until the clock uncertainty window \([\epsilon_{min}, \epsilon_{max}]\) passes to guarantee external consistency.

### Key takeaway

Never rely on physical server clocks to order transactional events; **clock skew causes silent data loss** in Last-Write-Wins systems unless mitigated by logical clocks or bounded uncertainty intervals.
