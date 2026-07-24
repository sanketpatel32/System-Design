# Vertical Scaling

> **Category:** Scaling

---

**Vertical Scaling (Scale-Up)** is the process of expanding system performance by **upgrading hardware resources—CPU cores, RAM memory, NVMe SSD storage, or network bandwidth—on a single existing server machine**.

### Vertical Scale-Up Topology

```
+-------------------------------------------------------------------------+
|                      VERTICAL SCALING (SCALE-UP)                        |
+-------------------------------------------------------------------------+

  INITIAL SMALL NODE                      UPGRADED ENTERPRISE NODE
  +-----------------------+               +-------------------------------+
  | Standard Cloud Server |               | High-Memory Enterprise Server |
  | - 4 vCPU Cores        |  ===========> | - 128 vCPU Cores              |
  | - 16 GB RAM           |  Scale Up     | - 1,024 GB (1 TB) RAM         |
  | - 100 GB NVMe Disk    |               | - 10 TB NVMe Array            |
  +-----------------------+               +-------------------------------+
                                          (Bounded by Physical Hardware Ceiling)
```

### Architectural Feature Matrix

| Dimension | Vertical Scaling (Scale-Up) |
| :--- | :--- |
| **Upgrade Mechanism** | Replacing instance type with higher capacity hardware (e.g., AWS `t3.medium` to `m6i.32xlarge`). |
| **Software Complexity**| Low (Requires zero code modifications or distributed systems algorithms). |
| **Data Consistency** | Easy (Maintains strong ACID transactions within a single shared memory space). |
| **Availability / Fault Tolerance**| Single Point of Failure (SPOF); server reboot requires downtime. |
| **Hardware Limits** | Bounded by maximum motherboard CPU socket and RAM slot capacity. |
| **Cost Trajectory** | Non-linear cost curve; high-end enterprise hardware becomes exponentially expensive. |
| **Primary Use Cases** | Traditional Relational Databases (Single Primary PostgreSQL/MySQL), In-Memory Caches. |

### When to Choose Vertical Scaling

1. **Early System Stage**: Quickest method to boost application capacity without re-architecting monoliths into distributed microservices.
2. **Relational Database Primaries**: Primary SQL databases requiring strict ACID transactions across complex multi-table JOIN operations.

### Key takeaway

Vertical scaling upgrades hardware specifications on a single server machine. Use vertical scaling for **early-stage applications and primary SQL databases** where software simplicity and strong ACID consistency outweigh hardware scaling bounds.
