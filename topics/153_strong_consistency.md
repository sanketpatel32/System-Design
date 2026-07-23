# Strong Consistency

> **Category:** Distributed Systems

---

Strong consistency (linearizability) = **every read returns the latest write, no stale
reads.** The strictest consistency model.

### The promise
- Operations appear to happen **in some order**, one at a time.
- A read always returns the most recent write's value (or a newer one).
- All clients see the same order.

### Why strong consistency
- **Banking**: balance must reflect latest deposit.
- **Inventory**: must not sell the same item twice.
- **Auth**: revoked tokens must be honored immediately.
- **Configuration**: changes apply immediately.

### How to achieve

#### 1. Single leader
- All writes go through one node.
- Reads from leader see all writes.
- Trade-off: leader is bottleneck + SPOF.

#### 2. Quorum
- `R + W > N` ensures read quorum and write quorum overlap.
- Read sees the latest write.

#### 3. Consensus (Raft, Paxos)
- Leader replicates log to followers.
- Write committed when quorum ACKs.
- Reads served from leader or quorum.

#### 4. Two-phase commit
- Coordinator ensures all participants commit or all abort.
- Atomic across systems.

### Cost
- **Higher latency**: every write needs quorum round trip.
- **Lower availability**: in a partition, must refuse writes (CAP).
- **Lower throughput**: writes serialized.

### Real-world
- **Spanner**: globally strongly consistent via TrueTime + Paxos.
- **etcd, ZooKeeper**: small data, strong consistency via Raft.
- **CockroachDB, YugabyteDB**: SQL with strong consistency.
- **Postgres/MySQL single-node**: inherently strong.

### Strong vs eventual
| | Strong | Eventual |
|--|--------|----------|
| Read sees latest | Always | Maybe not |
| Latency | Higher | Lower |
| Availability | Lower | Higher |
| Use case | Money, locks, config | Feeds, counts |

### Key takeaway
Strong consistency = no stale reads, achieved via **leader + quorum + consensus**. Costs latency
and availability. Use for transactional data (banking, inventory, config) where staleness is
unacceptable.
