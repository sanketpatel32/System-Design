# Leader Election

> **Category:** Distributed Systems

---

Leader election is the process of designated a **single node in a distributed cluster as the central coordinator (Leader)** responsible for managing cluster state, organizing tasks, and handling write transactions, while other nodes act as Followers or Standbys.

### Leader Election Architecture & Heartbeat Mechanism

When a Leader fails or network heartbeat times out, follower nodes initiate an election term to choose a new Leader.

```
+------------------+         Heartbeat Signal (OK)         +------------------+
|  Leader Node     | ------------------------------------> |  Follower Node A |
|  (Term 1)        | \                                     +------------------+
+------------------+          |              \     Heartbeat Signal (OK)         +------------------+
  (Leader Crashes!)     ---------------------------------> |  Follower Node B |
        |                                                  +------------------+
        v
  Heartbeat Timeout Expires!
  Follower A bumps Term to 2, becomes Candidate, requests votes:
        |
        +---> RequestVote(Term=2, CandidateId=NodeA) ---> Node B votes "YES"
        |
  Node A obtains Majority (2/3 votes) -> Node A becomes NEW LEADER for Term 2!
```

### Consensus-Based Leader Election vs Lease-Based Matrix

| Mechanism | Leader Determination | Partition Safety (Split-Brain) | Failure Detection Delay | Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Consensus (Raft/Zab)** | Majority Quorum Voting ($\lfloor N/2 
floor + 1$) | Fully Safe (Fencing tokens + Terms) | Heartbeat Timeout (100-500ms) | etcd, ZooKeeper |
| **Distributed Lock / Lease**| Key TTL in Shared Store | Requires strict fencing tokens | Lease Expiration TTL (5-15 seconds)| Redis Redlock, DynamoDB Lease |
| **Bully Algorithm** | Node with highest Process ID wins | Susceptible to network partitions | Linear Probe Timeout | Traditional Distributed Systems |

### Preventing Split-Brain with Epochs & Fencing Tokens

- **Split-Brain Problem**: A network partition isolates the old leader, causing followers to elect a new leader. Both leaders execute writes simultaneously, corrupting data.
- **Fencing Tokens (Monotonic Epochs)**: Every election increments an **Epoch Number / Term**. Storage nodes reject incoming write requests containing older epoch numbers.

```sql
-- Fencing check at database level
UPDATE cluster_state 
SET state_data = 'new_value', leader_epoch = 5 
WHERE leader_epoch < 5;
```

### Key Trade-offs & Operational Considerations

- ✅ **Simplifies Coordination**: A single leader avoids complex distributed multi-writer lock contention.
- ❌ **Temporary Unavailability During Election**: The cluster cannot process writes during the election window (typically 100ms to 2s).
- ❌ **Leader Bottleneck**: All write traffic routes through a single leader node.
### Concrete Leader Election Code Pattern (etcd Distributed Lease in Go)

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    clientv3 "go.etcd.io/etcd/client/v3"
    "go.etcd.io/etcd/client/v3/concurrency"
)

func CampaignForLeadership(client *clientv3.Client, nodeID string) {
    session, err := concurrency.NewSession(client, concurrency.WithTTL(5))
    if err != nil { log.Fatal(err) }
    defer session.Close()

    election := concurrency.NewElection(session, "/election/leader-lock")
    ctx := context.Background()

    // Campaign blocks until this node acquires leadership quorum
    if err := election.Campaign(ctx, nodeID); err != nil {
        log.Fatalf("Campaign failed: %v", err)
    }

    fmt.Printf("Node %s IS NOW THE ELECTED LEADER!\n", nodeID)
    // Perform Leader duties here...
}
```

### Production Edge Cases & Mitigation

1. **Transient Network Flaps**: Short 200ms network hiccups can cause unnecessary leader elections. Use **Pre-Vote Phases** (Raft) where candidates probe peer connectivity before incrementing election terms.
2. **Garbage Collection (GC) Pauses**: A 10-second Stop-The-World Java GC pause causes heartbeat loss. Storage engines must enforce **Fencing Tokens** to reject writes from paused leaders.

### Key takeaway

Leader election selects a **single coordinator node using consensus voting or distributed leases**, leveraging monotonic epoch tokens to fence out stale leaders and prevent split-brain data corruption.
