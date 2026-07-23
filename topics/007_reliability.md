# Reliability

> **Category:** System Design Basics

---

Reliability = the system **produces the correct output** for a given input, over time, even
under failures. Availability says "is it up"; reliability says "is it right".

### Building blocks
- **Redundancy**: replicate stateless services and data.
- **Idempotency**: safe retries — same input → same result, no double-charges.
- **Transactions / ACID**: correctness for multi-step writes.
- **Checksums**: detect corruption (TCP, S3, database pages).
- **Consistent hashing**: minimize data movement on node loss.
- **Quorum reads/writes**: tolerate minority node failures.

### Failure budget concept (SRE)
Each SLO (say 99.9%) gives a **budget** of allowed downtime (43 min/month). Use it for
deployments, risky migrations, or feature launches. When the budget is spent → freeze changes.

### Mean metrics
- **MTBF** (Mean Time Between Failures) — how often it breaks.
- **MTTR** (Mean Time To Recover) — how fast you fix it.
- Reliability ≈ MTBF / (MTBF + MTTR).

### Key takeaway
Reliability compounds: every layer adds a failure probability. A 99% service calling a 99%
service is 98%. So design each critical dependency to be **~10x** more reliable than the target.
