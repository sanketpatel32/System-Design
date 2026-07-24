# Distributed Lock

> **Category:** Distributed Systems

---

A distributed lock is a synchronization primitive used to guarantee **mutual exclusion across multiple independent compute nodes or processes** accessing a shared resource over a network. It ensures that only one process can execute a critical section at any given time.

### Distributed Lock Architecture & Fencing Token Pattern

To prevent race conditions caused by garbage collection (GC) pauses or network delays, distributed locks use auto-expiring leases combined with monotonically increasing fencing tokens.

```
+--------------------+      1. Acquire Lock (TTL 10s)       +-----------------------+
|  Client 1 (App A)  | -----------------------------------> |  Distributed Lock     |
|                    | <----------------------------------- |  Manager (etcd/Redis) |
+--------------------+   Returns Grant (Token: 81)          +-----------------------+
          |
   (Long GC Pause!)
   Lease Expires!
          |                                                 +-----------------------+
          |                 2. Lock Expires / Re-acquired   |  Client 2 (App B)     |
          |                 ------------------------------> |  Granted Lock         |
          |                                                 |  (Token: 82)          |
          v                                                 +-----------------------+
   Client 1 Wakes Up!                                                   |
   Tries to Write with Token 81                                         v Write Token 82 First
+-------------------------------------------------------------------------------------------+
| Shared Storage / Resource Database                                                       |
| - Rejects Client 1 write because Token 81 < Current Token 82! Storage remains SAFE!      |
+-------------------------------------------------------------------------------------------+
```

### Distributed Lock Implementation Matrix

| Storage Engine | Algorithm / Mechanism | Fault Tolerance | Risk / Trade-off | Production Suitability |
| :--- | :--- | :--- | :--- | :--- |
| **etcd / ZooKeeper** | Ephemeral Nodes + Keep-Alive Lease | High (Raft Majority Consensus) | Slightly higher lock acquisition latency | Highly Recommended (Mission Critical) |
| **Redis (Single Node)**| `SET key value NX PX 30000` | Low (Single Point of Failure) | Lock lost if Redis master crashes before replication | Good for non-critical tasks |
| **Redis (Redlock)** | Multi-node majority locking algorithm | Moderate | Subject to clock drift security criticisms | Use with caution |
| **Relational DB** | `SELECT ... FOR UPDATE` or Advisory Locks | High (ACID Guarantees) | Connection pool exhaustion under heavy scale | Small-scale / existing DB infrastructure |

### Mandatory Requirements for Safe Distributed Locking

1. **Safety (Mutual Exclusion)**: At most one client can hold the lock at any point in time.
2. **Liveness A (Deadlock Free)**: Lock auto-expires via TTL so a crashed client holding a lock does not block the system indefinitely.
3. **Liveness B (Fault Tolerance)**: Lock manager survives node crashes without losing lock state.
4. **Fencing Tokens**: Every lock grant returns an increasing counter token. Downstream resources reject commands presenting stale tokens.

### Key Trade-offs & Failure Modes

- ✅ **Strict Synchronization**: Prevents double-processing, duplicate payments, and concurrent file updates.
- ❌ **Latency Penalty**: Network round-trips to lock managers add latency to critical paths.
- ❌ **TTL Tuning Trade-off**: Setting lock TTL too short causes early lock release during GC pauses; setting TTL too long delays recovery if a worker crashes.
### Safe Redis Lock Implementation Code (Redisson / Lua Script)

```lua
-- Atomic Lock Acquisition Lua Script for Redis
-- Keys[1]: Lock Key name, ARGV[1]: Lock Token UUID, ARGV[2]: Expiration TTL (ms)
if redis.call('exists', KEYS[1]) == 0 then
    redis.call('hset', KEYS[1], ARGV[1], 1)
    redis.call('pexpire', KEYS[1], ARGV[2])
    return 1
end
return 0

-- Atomic Lock Release Lua Script (Prevents releasing another client's lock!)
if redis.call('hexists', KEYS[1], ARGV[1]) == 1 then
    redis.call('hdel', KEYS[1], ARGV[1])
    return 1
end
return 0
```

### Production Safety Warnings & Alternatives

- **Avoid Bare Redis Locks for Financial Assets**: Redis single-instance locks lose lock state during master pod crashes.
- **Use etcd or ZooKeeper for Mission-Critical Locks**: etcd uses Raft majority consensus to ensure a lock is never granted to two nodes simultaneously.

### Key takeaway

Distributed locks enforce **mutual exclusion across nodes** using lease timeouts and must mandate **monotonic fencing tokens** to protect downstream resources against process pauses and network delays.
