# Distributed System Basics

> **Category:** Distributed Systems

---

A distributed system is a collection of **autonomous computing nodes connected over a network** that coordinate their actions by passing messages, appearing to end users as a single coherent system. Distributed systems trade off single-node simplicity to achieve high availability, fault tolerance, and horizontal scalability.

### Core Distributed System Topology

Distributed nodes coordinate via network RPCs, partitioning state across machines to handle workloads beyond single-server physical limits.

```
                                  +-----------------------+
                                  |   API Gateway / LB    |
                                  +-----------------------+
                                     /        |                                     RPC / gRPC   RPC / gRPC   RPC / gRPC
                                   /          |                                            v           v           v
                          +---------------+ +---------------+ +---------------+
                          | Node A        | | Node B        | | Node C        |
                          | (Compute/State)| | (Compute/State)| | (Compute/State)|
                          +---------------+ +---------------+ +---------------+
                                  \           |           /
                                   +----------+----------+
                                    Network Consensus & Replication
```

### Fundamental Characteristics & Challenges Matrix

| Aspect | Single Node System | Distributed System | Engineering Mitigation |
| :--- | :--- | :--- | :--- |
| **Failure Mode** | All-or-nothing (System Crash) | Partial Failures (Nodes fail independently) | Health checks, retries, circuit breakers |
| **Clock Synchronization**| Shared hardware clock | Clock Skew across nodes | NTP, Vector Clocks, TrueTime |
| **Network Reliability** | Local memory access (reliable) | Unreliable Network (Packet loss, latency spikes) | Idempotency, ACKs, Retries |
| **Consistency** | Immediate shared memory consistency| CAP Theorem trade-offs | Consensus (Raft/Paxos), Quorum reads/writes |

### Eight Fallacies of Distributed Computing

Distributed system designs must account for these false assumptions:
1. The network is reliable.
2. Latency is zero.
3. Bandwidth is infinite.
4. The network is secure.
5. Topology doesn't change.
6. There is one administrator.
7. Transport cost is zero.
8. The network is homogeneous.

### Trade-offs & System Design Imperatives

- ✅ **Horizontal Scalability (Scale-Out)**: Add commodity servers to linearly scale throughput and storage capacity.
- ✅ **Fault Isolation**: Failure of a subset of nodes does not bring down the entire distributed service.
- ❌ **Complex Operational Overhead**: Monitoring, distributed tracing, network partitioning, and deployment coordination require specialized tooling.
### Network Partition Handling & CAP Theorem Dilemma

```
Network Partition Event (Split Datacenter Link):
+--------------------------+       Network Cut       +--------------------------+
| Region A (Primary Nodes) | <=====================> | Region B (Secondary Nodes|
| Nodes: [A1, A2, A3]      |       X X X X X         | Nodes: [B1, B2]          |
+--------------------------+                         +--------------------------+
  (3 Nodes = Majority Quorum)                          (2 Nodes = Minority Group)

System Decision Required:
- CP Mode (Consistency): Region A accepts writes; Region B REJECTS writes (Returns Error).
- AP Mode (Availability): Region A & B BOTH accept writes! System diverges (Eventual Conflict).
```

### Architectural Principles for High-Scale Distributed Systems

1. **Design for Partial Failure**: Assume every network link, disk drive, and server will fail at some point.
2. **Stateless Compute Tier**: Keep application web servers stateless; offload persistent state to distributed storage engines.
3. **Decouple Components with Async Queues**: Replace synchronous HTTP RPC calls with message queues (Kafka, RabbitMQ) to absorb traffic surges.

### Key takeaway

Distributed systems trade single-node simplicity for **horizontal scalability and availability**, but must explicitly handle partial node failures, network partitions, and clock skew.
