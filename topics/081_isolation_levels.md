# Isolation Levels

> **Category:** Databases

---

Isolation levels control **how much concurrent transactions can see of each other's
intermediate state**. Higher isolation = more correctness, less concurrency.

### The anomalies
| Anomaly | Description |
|---------|-------------|
| **Dirty read** | Reading another transaction's uncommitted data |
| **Non-repeatable read** | Same query returns different rows within a transaction |
| **Phantom read** | Same query returns different # of rows within a transaction |
| **Lost update** | Two transactions overwrite each other |
| **Write skew** | Two transactions read overlapping data, both write consistently in isolation but inconsistently together |

### The four SQL levels
| Level | Dirty | Non-repeatable | Phantom |
|-------|-------|----------------|---------|
| Read uncommitted | ✓ | ✓ | ✓ |
| Read committed (Postgres default) | ✗ | ✓ | ✓ |
| Repeatable read (MySQL default) | ✗ | ✗ | ✓ (or ✗ in Postgres) |
| Serializable | ✗ | ✗ | ✗ |

### Postgres defaults
- Default: **read committed**. Each query sees a snapshot as of when it started.
- Serializable uses **SSI (Serializable Snapshot Isolation)** — optimistic, may abort.

### Choosing
| Use case | Level |
|----------|-------|
| Reporting / dashboards | Read committed |
| Financial transactions | Serializable |
| Read-mostly with eventual ok | Read committed |
| Hot row contention | Careful! (use SELECT FOR UPDATE) |

### When to upgrade
- **Lost updates**: move to repeatable read + retry on serialization failure.
- **Write skew**: only serializable catches this (or explicit locks).
- **Phantom reads**: range locks at repeatable read, or serializable.

### Costs
- Higher isolation = more locks = less concurrency.
- Serializable aborts transactions on conflict → must retry.

### Key takeaway
Default isolation (read committed) is fine for most apps. Upgrade to **serializable** for
financial / correctness-critical paths — but always wrap in retry logic, since serializable
transactions may abort on conflict.
