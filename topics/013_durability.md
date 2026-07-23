# Durability

> **Category:** System Design Basics

---

Durability = **once data is acknowledged written, it persists** — even across power loss, disk
failures, or node crashes.

### Measured in nines
S3 advertises **11 nines** (99.999999999%) — i.e. expected loss of 1 object per 100,000 over
10,000 years.

### How durability is achieved
- **Replication**: copies on multiple disks/hosts/AZs.
- **Erasure coding**: data + parity shards across hosts (more space-efficient than replication).
- **WAL / journal**: append-only log before applying to data files (PostgreSQL, MySQL InnoDB).
- **FSync**: writes flushed to disk before ack.
- **End-to-end checksums**: detect silent corruption (bit rot).
- **Backup + offsite copy**: protect against site loss.

### Durability vs availability
A stored object is **durable** even if it's temporarily **unavailable** (e.g. the only online
replica is down). Conversely, an available object can be **non-durable** (in-memory only).

### Trade-offs
- **Synchronous replication** = max durability, adds write latency.
- **Async replication** = lower latency, small data-loss window on failover.
- **Erasure coding** = better space efficiency, slower reads on degraded nodes.

### Key takeaway
Durability is a **data-loss** guarantee, not a responsiveness one. Define how much data you can
lose (RPO) and pick a strategy that meets it.
