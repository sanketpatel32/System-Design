# Vertical Scaling

> **Category:** Scaling

---

Vertical scaling (scale up) = **add more CPU/RAM/disk to a single machine.** The simplest
scaling strategy.

### How
- Upgrade EC2 instance from `c5.large` to `c5.2xlarge`.
- Add RAM to a database server.
- Switch to a faster disk (NVMe).

### When it works
- **Databases** — single Postgres/MySQL often scales vertically first (more RAM = bigger cache).
- **Stateful systems** that are hard to shard.
- **Quick wins** — no code changes needed.
- **Low traffic** — one big machine is plenty.

### Pros
- ✅ Simple — no code changes.
- ✅ Preserves single-machine semantics (no distributed bugs).
- ✅ Often cheaper at small scale.

### Cons
- ❌ **Hard ceiling** — biggest instance has finite size.
- ❌ **SPOF** — one machine, one failure.
- ❌ **Downtime** to resize (usually requires reboot).
- ❌ **Cost curve** — biggest instances are disproportionately expensive.
- ❌ **No failover** — if it dies, the service dies.

### When vertical stops working
- You hit the **largest available instance size**.
- Your **availability target** requires redundancy.
- Your **cost** grows faster than benefit.
- **Write throughput** exceeds what one DB can do.

### Real world
- AWS RDS scales vertically up to `db.r6g.24xlarge` (~$15/hr).
- Beyond that, you need **read replicas** or **sharding**.

### Key takeaway
Vertical scaling is the **first** lever — easy wins with no code. But it has a ceiling and
introduces a SPOF. Plan to move to horizontal scaling (replicas, sharding) before you hit the
top.
