# Amazon S3 Style Storage

> **Category:** Storage Systems

---

Amazon S3-style storage represents distributed object storage systems engineered for **11 nines (99.999999999%) of data durability**, high availability, and strong read-after-write consistency over global HTTP endpoints.

### Distributed System Architecture

S3 systems separate request routing, index/metadata databases, and storage nodes.

```
+-----------------------------------------------------------------------------------+
|                                 S3 Client Request                                 |
+-----------------------------------------------------------------------------------+
                                          | HTTPS Request (AWS Signature v4)
                                          v
+-----------------------------------------------------------------------------------+
|                             Request Routing Gateway                               |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
    +-----------------------+                           +-----------------------+
    | Metadata Storage      |                           | Data Placement Engine |
    | (Strong Consistency)  |                           | Erasure Coding (8+4)  |
    +-----------------------+                           +-----------------------+
                |                                                   |
                v                                                   v
    +-----------------------+                           +-----------------------+
    | Distributed KV Store  |                           | Physical Disks/Racks  |
    +-----------------------+                           +-----------------------+
```

### Storage Classes & Lifecycle Management

S3 systems optimize cost by offering automated transitions between storage tiers based on access frequency.

| Storage Class | First-Byte Latency | Minimum Duration | Durability | Access Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **S3 Standard** | Milliseconds | None | 99.999999999% | Active, frequently accessed media |
| **S3 Infrequent Access**| Milliseconds | 30 Days | 99.999999999% | Backups, disaster recovery assets |
| **S3 Glacier Flexible** | Minutes - Hours | 90 Days | 99.999999999% | Historical archives |
| **S3 Glacier Deep Archive**| 12 - 48 Hours | 180 Days | 99.999999999% | Long-term compliance logs |

### Architectural Deep-Dive & Performance Optimization

- **Consistent Hashing & Prefix Sharding**: Partitioning key spaces across storage buckets allows handling 5,500 GET and 3,500 PUT requests per second per prefix.
- **Erasure Coding (e.g., 8+4 scheme)**: Data payload is split into 8 data blocks and 4 parity blocks distributed across failure domains. The system withstands loss of up to 4 nodes while storing only 1.5x payload size.
- **Byte-Range Fetches**: Clients issue `Range: bytes=0-1048575` headers to read specific file sections in parallel.

### Key takeaway

S3-style storage provides **ultra-durable, strongly-consistent storage** optimized through erasure coding, automated tiering, and prefix-level horizontal partitioning.
