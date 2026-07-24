# Master-Slave Replication

> **Category:** Databases

---

**Master-Slave Replication** (commonly referred to as Primary-Replica Replication) is a data architecture where a single database instance (**Master**) processes all data mutations (`INSERT`, `UPDATE`, `DELETE`), while one or more secondary instances (**Slaves**) process read operations (`SELECT`).

### Architecture & log streaming

```
                       +-------------------------+
                       |    Primary / Master     |
                       |  (Accepts Writes & Reads)|
                       +-------------------------+
                                    |
                        WAL / Binary Log Streaming
                                    v
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  Replica / Slave 1    |                       |  Replica / Slave 2    |
|   (Read-Only Pool)    |                       |   (Read-Only Pool)    |
+-----------------------+                       +-----------------------+
```

### Log streaming mechanisms

- **Statement-Based Replication**: The Master streams raw SQL statements (`INSERT INTO...`) to Slaves. *Risk: Non-deterministic functions like `NOW()` or `UUID()` evaluate differently on Slaves.*
- **Row-Based Replication**: The Master streams raw byte-level row modifications. *Ensures exact data parity, but generates larger log payloads.*
- **Mixed-Based Replication**: Defaults to statement-based, switching to row-based automatically for non-deterministic SQL queries.

### Operational Characteristics

| Component | Master Node | Slave Nodes |
| :--- | :--- | :--- |
| **Permitted Operations** | Reads and Writes (`INSERT`, `UPDATE`, `DELETE`, `DDL`) | Read-Only (`SELECT`) queries |
| **Scaling Capacity** | Vertical hardware scale-up | Horizontal addition of read-only replica nodes |
| **Node Failure Impact** | Requires failover / election of a new master | Load balancer routes reads to remaining active slaves |
| **Replication Delay** | Zero (Source of truth) | Subject to network and query execution replication lag |

### Promoting a Slave on Master Failure

When the Master node crashes, an automated failover controller (e.g., Orchestrator, Patroni) selects the Slave with the most up-to-date transaction log sequence number (LSN) and promotes it to become the new Primary.

### Key takeaway

Master-Slave replication simplifies read scaling and provides fault tolerance. Keep write rates within single-master capacity limits, and monitor replication lag to prevent stale reads.
