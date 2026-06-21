# Design Multi-Region Database

> **Category:** Advanced System Design Problems

---

Design a database spanning multiple regions for global low-latency + DR.

### Requirements
- **Functional**: read/write from any region; survive region failure.
- **Non-functional**: low-latency globally; strong or eventual consistency.

### Strategies

#### Single-leader (async replica)
- Writes to one region; replicate async.
- Reads from local replica (stale).
- Simple, low write latency locally.

#### Multi-leader (with conflict resolution)
- Each region accepts writes.
- Replicate + resolve conflicts.
- CRDTs / LWW / app merge.

#### Consensus-based (Spanner, CockroachDB)
- Paxos / Raft across regions.
- Strongly consistent globally.
- Higher write latency (cross-region quorum).

#### Active-Active with partitioning
- Each region owns certain data (user-by-region).
- No conflicts within partitions.

### Trade-offs
| | Single-leader | Multi-leader | Consensus |
|--|---------------|--------------|-----------|
| Write latency | Low (local) | Low | High (cross-region) |
| Conflict | No | Yes | No |
| Consistency | Eventual | Eventual | Strong |
| Availability | Lower | Higher | Lower |

### Real-world
- **DynamoDB Global Tables**: multi-leader, eventual.
- **Spanner, CockroachDB**: consensus, strong.
- **Cassandra**: tunable, multi-DC.

### Key takeaway
Multi-region DB: choose **single-leader** (simple, eventual), **multi-leader** (writes anywhere,
conflicts), or **consensus** (strong, slow writes). Pick based on consistency needs vs latency.
