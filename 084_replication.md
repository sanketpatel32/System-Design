# Replication

> **Category:** Databases

---

Replication = **copying data from a primary database to one or more replicas**, for
redundancy, read scaling, and disaster recovery.

### Why
- **High availability** — promote a replica if the primary dies.
- **Read scaling** — spread reads across replicas.
- **Geo-distribution** — replicas close to users.
- **Backup / analytics** — heavy queries offloaded from primary.

### Replication strategies

#### Synchronous
- Primary waits for replicas to ACK before committing.
- ✅ No data loss on failover.
- ❌ Slower commits (waits for network round-trip).
- ❌ Replica failure stalls primary.

#### Asynchronous
- Primary commits, sends to replicas later.
- ✅ Fast commits.
- ❌ **Replication lag** → potential data loss on failover.

#### Semi-synchronous
- Primary waits for at least one ACK (out of N).
- Compromise between sync and async.

### Topologies
- **Single-leader (master-slave)**: one writer, many readers. Most common.
- **Multi-leader**: each node accepts writes; conflict resolution needed.
- **Leaderless** (Dynamo-style): any replica accepts writes; quorum reconciles.

### Replication methods
- **Statement-based**: replay SQL statements (hard with non-deterministic functions).
- **Wal-based** (Postgres): stream WAL records.
- **Logical**: decode changes into a portable format (used by Debezium for CDC).

### Replication lag
- Cause: writes faster than replicas can apply.
- Effect: stale reads (read-your-writes violation).
- Mitigation: read-from-primary for X seconds after user's write; sticky sessions; tuned
  consistency.

### Key takeaway
Replication is essential for HA and read scaling. Pick **single-leader async** for most OLTP
workloads (good balance of speed and HA). Use **sync/semi-sync** when data loss is
unacceptable. Always plan for replication lag in your read paths.
