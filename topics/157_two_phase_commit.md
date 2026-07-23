# Two Phase Commit

> **Category:** Distributed Systems

---

Two-Phase Commit (2PC) = **a protocol for atomic transactions across multiple
participants.**

### The two phases

#### Phase 1: Prepare (vote)
```
Coordinator -> all participants: "PREPARE?"
Participant:  yes (locks resource, writes to log)  |  no (abort)
```

#### Phase 2: Commit or Abort
```
If ALL participants voted yes:
    Coordinator -> all: "COMMIT"
    Participant: commits, releases lock, ACKs.

If ANY participant voted no (or timed out):
    Coordinator -> all: "ABORT"
    Participant: rolls back, releases lock, ACKs.
```

### Why it works
- Once a participant votes "yes," it MUST be able to commit (it has locked resources).
- Coordinator's decision is final — participants must obey.
- Recoverable via logs (participants preserve the decision even if coordinator dies).

### Failure handling
- Participant crashes after "yes": on recovery, asks coordinator "what was the decision?"
- Coordinator crashes: participants hold locks and wait. New coordinator can take over.
- Network partition: blocked until resolved.

### Trade-offs
- ✅ **Atomicity** — all-or-nothing.
- ✅ Linearizable.
- ❌ **Blocking** — if coordinator dies, participants block (hold locks).
- ❌ **Slow** — multiple round trips.
- ❌ **Single point of failure** (coordinator).
- ❌ **Coupled** — participants must support the protocol.

### 3PC (three-phase)
- Adds a "pre-commit" phase to reduce blocking.
- Still rare; assumes bounded network delays.

### Real-world usage
- **Within a distributed DB**: CockroachDB, Spanner use consensus-based variants.
- **XA transactions**: JEE standard for multi-DB.
- **Cross-service**: rare — Saga is preferred.

### Key takeaway
2PC gives atomic cross-participant transactions but is **blocking, slow, and brittle**. Use it
within a distributed database, but for cross-service work, prefer **Saga + outbox** instead.
