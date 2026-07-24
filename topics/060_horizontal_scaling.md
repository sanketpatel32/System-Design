# Horizontal Scaling

> **Category:** Scaling

---

**Horizontal Scaling (Scale-Out)** is the process of expanding system capacity by **adding more commodity server instances to a distributed cluster**, distributing workload across nodes using load balancers, stateless application pools, and sharded database clusters.

### Horizontal Scale-Out Topology

```
+-------------------------------------------------------------------------+
|                    HORIZONTAL SCALING (SCALE-OUT)                       |
+-------------------------------------------------------------------------+

                         [ Ingress Traffic ]
                                  |
                                  v
                     +--------------------------+
                     |    LOAD BALANCER TIER    |
                     +--------------------------+
                                  |
       +--------------------------+--------------------------+
       |                          |                          |
       v                          v                          v
+--------------+           +--------------+           +--------------+
| Node 1       |           | Node 2       |           | Node N       |
| (8 Core/16GB)|           | (8 Core/16GB)|           | (8 Core/16GB)|
+--------------+           +--------------+           +--------------+
  (Virtually Unlimited Linear Capacity - Add Nodes dynamically on traffic demand)
```

### Vertical vs. Horizontal Scaling Comparison Matrix

| Dimension | Vertical Scaling (Scale-Up) | Horizontal Scaling (Scale-Out) |
| :--- | :--- | :--- |
| **Expansion Method** | Add CPU/RAM to single server. | Add more server nodes to cluster. |
| **Scalability Limit** | Hard ceiling (Physical hardware max). | Virtually unlimited linear scaling. |
| **Fault Tolerance** | Low (Single Point of Failure). | High (Node failures absorbed by remaining pool). |
| **Session Management**| In-memory local sessions allowed. | Requires stateless servers or Redis session store. |
| **Implementation Cost**| Linear to non-linear hardware cost. | Linear cloud instance cost curve (Commodity hardware). |
| **System Complexity** | Low. | High (Requires load balancers, service discovery, distributed data). |

### Core Architectural Prerequisites for Scale-Out

1. **Stateless Application Servers**: Remove local session state and local file storage dependencies from application instances. Offload state to Redis, S3, or database clusters.
2. **Database Partitioning & Sharding**: Distribute write traffic horizontally across sharded database clusters using consistent hashing.
3. **Automated Elastic Auto-Scaling**: Configure cloud auto-scaling groups (K8s HPA or AWS ASG) to add or terminate nodes based on CPU and memory utilization thresholds.

### Key takeaway

Horizontal scaling enables **virtually unlimited capacity growth** by adding commodity server instances to a load-balanced cluster. Design application tiers to be **stateless** and leverage **elastic auto-scaling groups** to adjust instance capacity dynamically.
