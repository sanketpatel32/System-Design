# CAP Theorem

> **Category:** System Design Basics

---

CAP = **Consistency, Availability, Partition tolerance — pick two** during a network partition.
In reality you pick one of C or A, because P (partitions) **will** happen.

### The three
- **C (Consistency)**: every read returns the latest write or an error.
- **A (Availability)**: every request gets a non-error response (may be stale).
- **P (Partition tolerance)**: the system continues despite network splits.

### Why P is non-optional
Networks fail. You can't choose to "not have partitions". So the real choice is:
- **CP**: reject requests to stay consistent (e.g. HBase, Zookeeper, etcd).
- **AP**: keep serving, accept divergence (e.g. Cassandra, DynamoDB, Riak).

```
       During a network partition:
       CP: "I'll refuse writes"           AP: "I'll serve stale reads"
```

### Common misconception
CAP applies **only during partitions**. When the network is healthy, you can have both C and A.
Modern systems (Spanner, CockroachDB) are "effectively CA" in the common case via consensus.

### PACELC (the refinement)
Without partitions: choose **Latency vs Consistency**.
- Cassandra (ELC): low latency, eventual consistency.
- Spanner (EC): strong consistency, slightly higher latency.

### Key takeaway
Don't say "we're CA" in an interview — that's almost always wrong. Pick **CP or AP** based on
the business rule, and explain the trade-off.
