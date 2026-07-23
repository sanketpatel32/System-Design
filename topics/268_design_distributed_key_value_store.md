# Design Distributed Key-Value Store

> **Category:** Advanced System Design Problems

---

Design a distributed KV store like DynamoDB.

### Requirements
- **Functional**: get/put/delete; eventually consistent reads.
- **Non-functional**: always writable; HA; scales horizontally.

### Architecture (Dynamo-style)
- **Consistent hashing** for partitioning.
- **Replication** to N nodes.
- **Quorum** reads/writes (R, W).
- **Vector clocks** for conflicts.
- **Gossip** for membership.
- **Read repair + anti-entropy** for convergence.

### Consistency
- Tunable: (R + W > N) for strong.
- Eventually consistent otherwise.
- Read-your-writes via sticky session.

### Conflict resolution
- Vector clocks detect concurrent writes.
- LWW default.
- App can resolve via read-repair.

### Membership
- Gossip protocol.
- Nodes join/leave freely.
- Partitioner adapts.

### Key takeaway
Dynamo-style KV = consistent hashing + N-way replication + tunable quorum + vector clocks +
gossip. Optimizes for **availability** (always writable). Conflicts surfaced to app.
