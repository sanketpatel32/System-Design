# Estimate Number of Servers

> **Category:** Back-of-the-Envelope Estimation

---

Estimating the **Number of Application Servers** determines compute capacity (CPU cores, RAM memory, worker processes) required to handle peak incoming request throughput (Peak QPS) while maintaining low latency SLAs.

### Server Compute Load Distribution

```
+-------------------------------------------------------------------------+
|                  LOAD BALANCED SERVER FLEET TOPOLOGY                    |
+-------------------------------------------------------------------------+

                             [ Ingress Traffic ]
                               (Peak 60,000 QPS)
                                       |
                                       v
                          +-------------------------+
                          |   LOAD BALANCER TIER    |
                          +-------------------------+
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
       v                               v                               v
+--------------+                +--------------+                +--------------+
| App Server 1 |                | App Server 2 |                | App Server N |
| (1,000 QPS)  |                | (1,000 QPS)  |                | (1,000 QPS)  |
+--------------+                +--------------+                +--------------+
  (Sized for 60 Servers + 30% Headroom = 78 Servers Fleet)
```

### Compute Sizing Benchmarks

| Workload Type | Single Server QPS Capacity | Primary Bottleneck | Example Tech Stack |
| :--- | :--- | :--- | :--- |
| **Lightweight I/O Bound** | 5,000 - 10,000 QPS | Network NIC, Epoll event loop | Go, Node.js, Netty, Nginx |
| **Standard REST API** | 1,000 - 2,000 QPS | CPU context switching, DB I/O | Java Spring Boot, Python FastAPI |
| **Heavy Computational** | 100 - 500 QPS | CPU processing, cryptography | Image encoding, ML inference |

### Step-by-Step Server Fleet Sizing Walkthrough

1. **Determine Peak QPS Requirement**:
   - Given Peak QPS = 60,000 QPS.

2. **Estimate Single Application Server Capacity**:
   - Assume a standard 8-core, 16 GB RAM server handling a typical REST API service can comfortably serve **1,000 QPS** at p99 latency < 50ms.

3. **Calculate Baseline Server Count**:

**Baseline Server Count** = (Peak QPS) / (Capacity per Server) = 60,000 QPS / 1,000 QPS/server = 60 servers

4. **Apply Safety Buffer (+30% Headroom for CPU Spikes / AZ Outage)**:

**Total Server Fleet** = 60 × 1.30 = 78 Servers

5. **Multi-AZ Distribution**:
   - Divide 78 servers across 3 Availability Zones (AZs) = 26 servers per AZ.

### Key takeaway

Calculate total server count by dividing **Peak QPS** by single-node QPS throughput capacity. Add a **30-50% safety margin** to handle CPU utilization spikes and maintain high availability during server failures or AZ outages.
