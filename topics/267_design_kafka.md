# Design Kafka

> **Category:** Distributed Systems Infrastructure

---

Apache Kafka is a distributed event streaming platform capable of handling high-throughput real-time data feeds via append-only commit logs.

### System Requirements
- **Functional Requirements**:
  - Publish-subscribe event streaming across partitioned topics.
  - Long-term log retention and replay capability.
  - Parallel consumption across scaled consumer groups.
- **Non-Functional Requirements**:
  - Extreme Throughput: Write millions of events per second with sub-10ms latency.
  - Durability: Replicate partition logs across In-Sync Replicas (ISR).
  - High Efficiency: Zero-copy network transfer (`sendfile`) bypassing user-space CPU buffers.

### System Architecture
```
[ Event Producers ] ---> [ Kafka Broker Cluster ]
                                  |
    +-----------------------------+-----------------------------+
    | Topic: "orders"                                           |
    v                                                           v
[ Partition 0 (Leader) ]                                [ Partition 1 (Leader) ]
  (Sequential Commit Log)                                 (Sequential Commit Log)
    |                                                           |
    v (ISR Sync)                                                v (ISR Sync)
[ Partition 0 (Follower) ]                              [ Partition 1 (Follower) ]
    |                                                           |
    +-----------------------------+-----------------------------+
                                  |
                                  v
                    [ Consumer Group A (Workers) ]
```

### Key Performance Innovations
| Mechanism | How It Works | Performance Impact |
|---|---|---|
| **Sequential Disk I/O** | Appends messages exclusively to the end of partition files | Disk I/O speed rivals memory speed (~ 100 MB/s sequential throughput). |
| **Zero-Copy (`sendfile`)** | Transfers disk page cache data directly to NIC buffer bypassing JVM | Reduces CPU copy operations from 4 to 2, drastically lowering latency. |
| **Page Cache Utilization** | Relies on OS page cache rather than JVM heap memory | Eliminates JVM Garbage Collection overhead for massive buffers. |

### Producer Durability Settings (`acks`)
- `acks=0`: Producer does not wait for broker response (fire-and-forget, highest throughput, lowest durability).
- `acks=1`: Producer waits for Partition Leader to write to local log.
- `acks=all` (`-1`): Producer waits until all In-Sync Replicas (ISR) acknowledge the write (maximum durability).

### Key takeaway
Apache Kafka achieves massive streaming throughput by exploiting sequential append-only disk logs, OS page cache zero-copy transfers (`sendfile`), and partitioned topic consumer groups.
