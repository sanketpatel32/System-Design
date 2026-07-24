# Two Phase Commit

> **Category:** Distributed Systems

---

Two-Phase Commit (2PC) is an atomic commitment protocol that ensures **all database participants in a distributed system commit or abort a transaction together**, regardless of individual node failures.

### Two-Phase Commit Protocol Sequence

```
+---------------+                Phase 1: Prepare                +---------------+
| Coordinator   | ---------------------------------------------> | Participant A |
+---------------+ <--------------------------------------------- +---------------+
    |               Returns VOTE_COMMIT or VOTE_ABORT                |
    |                                                                |
    | -------------------------------------------------------------> +---------------+
    | <------------------------------------------------------------- | Participant B |
    |                                                                +---------------+
    |
    |                            Phase 2: Commit / Abort
    | -------------------------------------------------------------> +---------------+
    |                                                                | Participant A |
    |                                                                +---------------+
    | -------------------------------------------------------------> +---------------+
    |                                                                | Participant B |
```

### Protocol Steps Breakdown

1. **Phase 1 (Prepare Phase)**:
   - Coordinator sends `PREPARE` request to all participants.
   - Participants write transaction data to local Write-Ahead Log (WAL), acquire locks, and reply with `VOTE_COMMIT` or `VOTE_ABORT`.
2. **Phase 2 (Commit / Abort Phase)**:
   - If ALL participants voted `VOTE_COMMIT`, Coordinator writes `COMMIT` to log and sends `GLOBAL_COMMIT` commands.
   - If ANY participant voted `VOTE_ABORT` (or timed out), Coordinator broadcasts `GLOBAL_ABORT`.

### Protocol Vulnerabilities & Trade-offs

| Vulnerability | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Blocking Protocol** | Participants hold database row locks indefinitely while waiting for coordinator | Timeout thresholds & 3PC non-blocking state transitions |
| **Single Point of Failure** | If Coordinator crashes mid-Phase 2, participants block in uncertain state | Replicated Leader-based Coordinators (Raft-backed 2PC) |
| **High Latency** | Requires multiple network RTTs and synchronous disk log flushes | Avoid cross-region 2PC transactions |

### Key takeaway

Two-Phase Commit guarantees **strict cross-node transaction atomicity**, but introduces performance bottlenecks and blocking lock behavior during coordinator outages.
