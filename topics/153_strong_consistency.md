# Strong Consistency

> **Category:** Distributed Systems

---

Strong consistency (or Linearizability) is a consistency model where **every read operation is guaranteed to return the value of the most recent write operation**, regardless of which replica node services the request. The distributed system behaves as if there were only a single atomic copy of the data.

### Strong Consistency Architecture & Consensus Flow

Reads and writes require synchronous quorum consensus or leader validation before returning control to the caller.

```
+---------------+        1. Write Request (`x = 99`)        +-------------------------+
| Client A      | ----------------------------------------> | Leader Node             |
+---------------+                                           +-------------------------+
                                                                  |            |
                                                    2. Sync Write |            | 2. Sync Write
                                                    (Raft/Paxos)  v            v
                                                            +----------+  +----------+
                                                            | Node B   |  | Node C   |
                                                            +----------+  +----------+
                                                                  |            |
                                                    3. ACK Write  v            v 3. ACK Write
                                                            +------------------------+
                                                            | Majority Replicated!   |
                                                            +------------------------+
                                                                          |
+---------------+        4. Read Request (`x`)                    v
| Client B      | ----------------------------------------> Returns `x = 99` ALWAYS!
+---------------+                                           (No Stale Read Possible)
```

### Strong vs Eventual Consistency Comparison Matrix

| Dimension | Strong Consistency (Linearizability) | Eventual Consistency |
| :--- | :--- | :--- |
| **Read Accuracy** | Guaranteed latest written value | May return stale data temporarily |
| **Write Latency** | Higher (Synchronous majority round-trips) | Lower (Local write + async background sync) |
| **Availability Under Partition**| Lower (Rejects writes if majority lost) | Higher (Accepts local writes anywhere) |
| **Implementation Engine**| Raft, Paxos, 2PC, Spanner TrueTime | Cassandra, DynamoDB (Eventual Mode), Riak |
| **Primary Use Cases** | Financial ledgers, stock trading, inventory limits| Social media feeds, analytics, metrics |

### Protocol Implementation Requirements

1. **Leader Read Leases / Read Index**: To execute strong consistency reads without issuing full Paxos/Raft consensus logs every read, leaders hold bounded time leases or verify heartbeat connectivity before serving reads.
2. **Quorum Intersection (R + W > N)**: Reading from R nodes and writing to W nodes guarantees at least one node in the read set contains the newest transaction.

### Key Trade-offs & System Constraints

- ✅ **Simplifies Application Logic**: Developers do not need to handle stale data, out-of-order writes, or manual conflict resolution.
- ✅ **Prevents Financial Double-Spending**: Essential for payment transactions, inventory management, and seat reservations.
- ❌ **Latency Penalty**: Network round-trips to replicate data synchronously across nodes increase Time-to-First-Byte.
- ❌ **Reduced Availability**: If network partitions isolate a minority group of nodes, those nodes must reject writes to protect consistency.
### Leader Read Index / Read Lease Architecture

To serve linearizable strongly consistent reads without running a full Paxos/Raft log consensus round for every read:

```
+----------------------------------------------------------------------------------------------------+
| Leader Node (Raft Lease Engine)                                                                    |
|                                                                                                    |
|  1. Holds valid Leader Lease (Time-bounded window guaranteed by majority heartbeats)              |
|  2. Checks local read index counter against last committed log entry                               |
|  3. Serves Read directly from local RAM state machine! (Sub-millisecond Linearizable Read!)        |
+----------------------------------------------------------------------------------------------------+
```

### System Design Selection Framework

- **Select Strong Consistency For**: Financial transaction ledgers, stock order matching engines, inventory management, auth permission changes.
- **Select Eventual Consistency For**: Social media timelines, video view counters, chat status, product recommendations.

### Key takeaway

Strong consistency provides **linearizable read-after-write guarantees** using synchronous consensus protocols (Raft/Paxos), trading away write latency and availability under network partitions to guarantee data correctness.
