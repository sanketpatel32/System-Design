# Leader Election

> **Category:** Distributed Systems

---

Leader Election is the mechanism by which a distributed cluster **designates a single node (Leader) to coordinate decisions**, assign tasks, or manage state writes, transitioning follower nodes automatically if the leader fails.

### Heartbeat & Election Sequence Diagram

```
+---------------+           1. Periodic Heartbeat (Term 1)          +---------------+
| Leader Node   | ------------------------------------------------> | Follower Node |
+---------------+                                                   +---------------+
        |                                                                   |
     (Crashes!)                                                      (Timeout Expires!)
        x                                                                   | 2. Increment Term to 2
                                                                            |    RequestVotes RPC
                                                                            v
                                                                    +---------------+
                                                                    | Candidate     |
                                                                    +---------------+
                                                                            | 3. Collect Majority Votes
                                                                            v
                                                                    +---------------+
                                                                    | New Leader    |
                                                                    +---------------+
```

### Leader Election Strategies

| Algorithm / Mechanism | Mechanism | Split-Brain Defense | Election Speed | Production Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **Raft Randomized Timers**| Randomized election timeouts (150-300ms)| Term Epochs + Majority Quorum | Fast (100 - 500ms) | etcd, Consul, Kafka KRaft |
| **Lease Locking** | Time-bound lock key in distributed KV store | TTL Expiration + Fencing Tokens | Medium (TTL dependent)| Redis (Redlock), ZooKeeper |
| **Bully Algorithm** | Node with highest ID claims leadership | Node ID Priority Ranking | Slow (High RPC count) | Enterprise Clusters |

### Key System Considerations

- **Randomized Election Timeouts**: Prevents vote-splitting where multiple candidates trigger election requests at the exact same millisecond.
- **Fencing Tokens**: Monotonically increasing numbers provided with leader leases to invalidate delayed requests from stale, partitioned former leaders ("zombie leaders").

### Key takeaway

Leader election ensures single-coordinator control through **majority voting and randomized timeouts**, using monotonically increasing epoch fencing tokens to defeat zombie leaders.
