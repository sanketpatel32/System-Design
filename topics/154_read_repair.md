# Read Repair

> **Category:** Distributed Systems

---

Read repair = **fixing inconsistent replicas when a read detects them**. A technique for
maintaining eventual consistency.

### The problem
- Replicas can drift (network blip, restart, missed write).
- How do you bring them back in sync?

### How read repair works
```
1. Client reads key K.
2. Coordinator reads from multiple replicas (quorum).
3. Sees responses differ.
4. Identifies the latest version.
5. Writes it back to the stale replicas.
6. Returns the latest to the client.
```

### When it triggers
- Only when a key is **read**.
- Stale keys that are never read aren't repaired (until anti-entropy).

### Trade-offs
- ✅ Self-healing — drives convergence.
- ✅ No background job needed.
- ✅ Repairs the keys that matter (read ones).
- ❌ Adds latency to reads (extra write).
- ❌ Doesn't repair cold keys.

### Anti-entropy (complement)
- Background process compares replicas.
- Repairs **all** keys, even unread ones.
- Uses Merkle trees for efficiency (compare hashes, only sync diffs).

### In Cassandra
- Read repair on `LOCAL_QUORUM`/`ALL` reads.
- Configurable probability (don't repair every read).
- Background `nodetool repair` for anti-entropy.

### In DynamoDB
- Happens implicitly for strongly consistent reads.

### Hinted handoff (related)
- If a replica is down when write occurs, the coordinator stores a "hint."
- When the replica returns, the hint is delivered.

### Key takeaway
Read repair fixes stale replicas during reads, driving eventual consistency. Complements
**anti-entropy** (background repairs) and **hinted handoff** (replay missed writes). Together
they keep replicas in sync.
