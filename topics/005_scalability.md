# Scalability

> **Category:** System Design Basics

---

Scalability is the capability of a system to **handle increased workload demand gracefully by adding resources**, without sacrificing performance or stability. Workload growth can take the form of higher request volumes (QPS), larger data datasets, higher concurrent user connections, or increased write fan-out.

### Vertical vs. Horizontal Scaling Topology

```
   VERTICAL SCALING (Scale-Up)            HORIZONTAL SCALING (Scale-Out)
   +-------------------------+            +-------+   +-------+   +-------+
   |   Single Massive Node   |            | Node1 |   | Node2 |   | Node3 |
   |  [ 128 Cores / 1TB RAM ]|            | 8 Core|   | 8 Core|   | 8 Core|
   +-------------------------+            +-------+   +-------+   +-------+
                |                                     ^
       Physical HW Limit                              |
        Single Point Fail                      Load Balancer Distributes
```

### Scaling Paradigms Comparison

| Dimension | Vertical Scaling (Scale-Up) | Horizontal Scaling (Scale-Out) |
| :--- | :--- | :--- |
| **Mechanism** | Upgrading CPU, RAM, or NVMe SSDs on a single machine. | Adding more commodity servers to a distributed pool. |
| **Complexity** | Low initially (no architectural modifications required). | High (requires load balancers, sharding, consensus). |
| **Hardware Limit** | Hard ceiling bounded by maximum motherboard socket limits. | Virtually unlimited linear scaling potential. |
| **Availability** | Single Point of Failure (SPOF); requires maintenance downtime.| High availability; individual node failure causes no outage. |
| **Data Consistency**| Strong ACID consistency maintained easily in single memory space.| Requires distributed consistency protocols (Raft, Paxos, 2PC).|
| **Cost Curve** | Non-linear; high-end enterprise hardware becomes exponentially expensive. | Linear; commodity cloud instances (e.g., AWS EC2 instances). |

### Dimensions of System Scalability

1. **Size Scalability**: Ability to process larger datasets without throughput degradation (e.g., partitioning a 100TB table across sharded database nodes).
2. **Geographic Scalability**: Ability to maintain low latency for users globally by deploying Multi-Region clusters, Edge Computing, and CDNs.
3. **Administrative Scalability**: Ability for engineering teams to manage growing cluster sizes without linear overhead (automated provisioning, Kubernetes orchestration).

### Common Scalability Bottlenecks

- **Stateful Application Servers**: Prevents elastic auto-scaling. *Solution*: Offload session state to Redis or JWT tokens.
- **Monolithic Database Writes**: Primary database server CPU limits write capacity. *Solution*: Database sharding, write-behind caching, message queues.
- **Hotspot Partitioning**: Non-uniform key distribution causes a single shard to overheat. *Solution*: Salting partition keys, consistent hashing.

### Key takeaway

Horizontal scaling is the primary architectural paradigm for cloud-native web scale systems. Design systems to be **stateless at the application tier** and use **partitioning and asynchronous queues** at the data tier to enable seamless scale-out capacity.
