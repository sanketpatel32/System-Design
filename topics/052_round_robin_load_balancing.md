# Round Robin Load Balancing

> **Category:** Load Balancing

---

**Round Robin Load Balancing** is the simplest traffic distribution algorithm. It processes incoming requests by cycling sequentially through an ordered list of healthy backend application servers.

### Sequential Round Robin Distribution Topology

```
+-------------------------------------------------------------------------+
|                ROUND ROBIN SEQUENTIAL TRAFFIC DISTRIBUTION              |
+-------------------------------------------------------------------------+

  Incoming Requests: [Req 1] -> [Req 2] -> [Req 3] -> [Req 4]
                                 |
                                 v
                 +-------------------------------+
                 |  ROUND ROBIN LOAD BALANCER    |
                 +-------------------------------+
                   |             |             |
         +---------+             |             +---------+
         | (Req 1, 4)            | (Req 2)               | (Req 3)
         v                       v                       v
  +--------------+        +--------------+        +--------------+
  | Server 1     |        | Server 2     |        | Server 3     |
  +--------------+        +--------------+        +--------------+
```

### Round Robin Variants Technical Comparison

| Variant Algorithm | Distribution Mechanism | Best Suited Scenario | Trade-off |
| :--- | :--- | :--- | :--- |
| **Simple Round Robin** | Equal sequential rotation (1 arrow 2 arrow 3 arrow 1). | Homogeneous server fleets handling identical short requests. | Assumes equal server capacity and request duration. |
| **Weighted Round Robin** | Server assigned weight W; higher weight node gets proportionally more requests. | Heterogeneous server fleets (e.g., 16-core vs 4-core nodes). | Requires manual configuration of weights. |
| **Dynamic Weighted RR** | Load balancer dynamically adjusts weights based on CPU/RAM metrics. | Variable cloud instance performance fleets. | Higher LB CPU monitoring overhead. |

### Limitations of Simple Round Robin

1. **Non-Uniform Server Hardware**: If Server 1 has 32 Cores and Server 2 has 4 Cores, Simple Round Robin overloads Server 2 while underutilizing Server 1.
2. **Variable Request Execution Durations**: If Request 1 takes 10 seconds (file export) while Request 2 takes 5 milliseconds, a server can become overwhelmed if assigned multiple slow requests sequentially.

### Key takeaway

Simple Round Robin is optimal for **identical stateless servers processing uniform short-lived requests**. Use **Weighted Round Robin** when backing servers have unequal hardware specifications.
