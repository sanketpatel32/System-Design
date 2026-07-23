# Fault Tolerance

> **Category:** System Design Basics

---

Fault tolerance = **the system keeps working correctly** even when components fail. Failure is
treated as normal, not exceptional.

### Failure types
- **Hardware**: disk dies, NIC fails, rack power loss.
- **Software**: bug, OOM, deadlock, bad deploy.
- **Network**: partition, packet loss, DNS outage.
- **Human**: bad config, accidental deletion.

### Patterns
- **Redundancy**: N+1 or N+M replicas. Lose one, others carry on.
- **Quorum**: 3-of-5 nodes agree → tolerate 2 failures.
- **Graceful degradation**: feature flags turn off non-essential paths.
- **Bulkheads**: isolate failures (thread pool per tenant) so one slow tenant doesn't stall all.
- **Retries + circuit breaker**: heal transient faults, stop hammering dead ones.
- **Idempotency**: safe to retry — no double effects.

### Failure detection
- **Heartbeats** between nodes (gossip, Raft).
- **Health checks** at LBs.
- **Watchdog processes** restart crashed services.
- **Quorum-based** — if a minority disagrees, treat them as faulty.

### Key takeaway
Design assuming **everything will fail**. Quantify the failure model: "tolerate loss of 1 AZ,
2 nodes, 1 region." Then architect redundancy to meet that.
