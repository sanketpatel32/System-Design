# Leader Election

> **Category:** Distributed Systems

---

Leader election = **choosing one node to coordinate** (handle writes, manage state) while
others act as followers.

### Why have a leader
- Simplifies coordination: one writer, no write conflicts.
- Linearizable writes easier.
- Routing: clients talk to leader.

### Election algorithms

#### Bully algorithm
- Node with highest ID wins.
- Sends "I'm alive" to higher-ID nodes; if none answer, becomes leader.
- Simple, but "bullying" by ID is arbitrary.

#### Ring algorithm
- Nodes in a logical ring.
- Election message circulates with candidate IDs.
- Highest ID becomes leader.

#### Raft / Paxos (real-world)
- Term-based voting.
- Candidates request votes; majority wins.
- Heartbeats keep leadership; if missed, new election.

### ZooKeeper / etcd approach
- Use a coordination service (ZK, etcd) to implement locks.
- First node to acquire the lock becomes leader.
- If leader dies, lock releases, others compete.
```
create ephemeral node /leader
  if success: I'm leader
  else: watch /leader; if it disappears, try again
```

### Split-brain
- Two nodes both think they're leader.
- Caused by network partition + bad election.
- Disaster: both accept writes → conflicts.
- Solutions: **quorum** (need majority), **fencing tokens** (old leader's writes rejected).

### Fencing
- Each leader gets a monotonically increasing token.
- Storage rejects writes with stale tokens.
- Prevents "zombie leader" writes after losing leadership.

### Lease-based election
- Leader holds a time-bounded lease.
- Must renew before expiry.
- If lease expires, new election.

### Key takeaway
Leader election simplifies coordination. Use **Raft-style voting** (etcd, Consul) or **ZooKeeper
locks** for production. Always guard against split-brain with **quorum + fencing tokens**.
