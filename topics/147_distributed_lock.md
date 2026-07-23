# Distributed Lock

> **Category:** Distributed Systems

---

A distributed lock = **a mutual exclusion primitive across multiple nodes**, ensuring only
one process at a time does something.

### Use cases
- **Leader election** (lock = "I'm the leader").
- **Preventing double-execution** of scheduled jobs.
- **Serializing updates** to a shared resource.
- **Migration coordination**.

### Implementations

#### ZooKeeper / etcd
- Create an ephemeral node: `/locks/my-lock`.
- First creator wins.
- Others watch; if node disappears, retry.
```
create ephemeral node /locks/my-lock
  if success: I hold the lock
  else: watch /locks/my-lock; if it disappears, try again
```

#### Redis `SET NX EX`
```
SET lock:key "owner_id" NX EX 30
```
- Atomic create-if-not-exists with TTL.
- Release: Lua script checking owner_id (don't release others' locks).

#### Database
- `INSERT INTO locks (key, owner, expires_at) ... ON CONFLICT DO NOTHING`.
- Less efficient but works.

### The fencing problem
```
1. Client 1 acquires lock (TTL 30s).
2. Client 1 pauses (GC, network) for 40s.
3. Lock expires; Client 2 acquires.
4. Both think they hold the lock → both write → corruption.
```
Solution: **fencing tokens**.
- Each lock acquisition gets a monotonically increasing token.
- Storage rejects writes with stale tokens.

### Redlock (controversial)
- Redis algorithm that uses N independent Redis nodes.
- Acquire on majority.
- Author (Martin Kleppmann) argues it's not safe under GC pauses + clock drift.

### When NOT to use
- If you need correct mutual exclusion, **don't use Redis alone** — use ZK/etcd with fencing.
- If you can avoid locks entirely (idempotent operations, atomic DB ops), do that.

### Key takeaway
Distributed locks are tricky. Use **ZooKeeper/etcd with fencing tokens** for correctness.
Redis `SET NX EX` works for non-critical cases. Beware GC pauses and clock drift — they break
naive lock implementations.
