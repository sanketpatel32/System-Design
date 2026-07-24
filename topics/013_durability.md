# Durability

> **Category:** System Design Basics

---

Durability is the guarantee that **once a transaction is committed or a write operation is acknowledged, the saved data will persist permanently** and will not be lost due to system crashes, power outages, or hardware failures.

### Multi-Tier Durability Architecture

```
+-------------------------------------------------------------------------+
|                      MULTI-TIER DURABILITY FLOW                         |
+-------------------------------------------------------------------------+

  [ Write Request ] 
          |
          v
  +--------------------------------+
  | In-Memory Buffer / WAL (Disk)  |  (Step 1: Synchronous Write-Ahead Log)
  +--------------------------------+
          |
          +------------------------+
          |                        |
          v                        v
  +---------------+        +------------------+
  | Primary DB    |=======>| Secondary Nodes  | (Step 2: Multi-AZ Replication)
  | Local NVMe    | Sync   | (Cross-Region)   |
  +---------------+        +------------------+
          |
          v
  +--------------------------------+
  | Blob Storage Backup (S3)       |  (Step 3: Point-in-Time Backups)
  +--------------------------------+
```

### Durability Mechanisms & Standards

| Mechanism | Description | Use Case / System | Durability SLA |
| :--- | :--- | :--- | :--- |
| **Write-Ahead Logging (WAL)**| Appending writes sequentially to persistent disk log before applying changes to main DB tables. | PostgreSQL, MySQL InnoDB | Zero data loss on power failure |
| **Multi-AZ Synchronous Sync**| Replicating written blocks across multiple physically isolated Availability Zones. | AWS Aurora, CockroachDB | Protection against data center disasters |
| **Erasure Coding & RAID** | Splitting data into fragments, expanding and encoding with redundant parity bits. | Object Storage (AWS S3) | 99.999999999% (11 Nines) |
| **Point-in-Time Recovery (PITR)**| Continuous WAL archiving combined with periodic database snapshots. | Production RDBMS backups | Recovery to specific second |

### Metrics: RPO and RTO

- **Recovery Point Objective (RPO)**: The maximum acceptable amount of data loss measured in time during a disaster (e.g., RPO = 0 means zero data loss).
- **Recovery Time Objective (RTO)**: The maximum acceptable duration of system downtime after a failure before services are fully restored.

### Key takeaway

Durability guarantees that committed data is never lost. Achieve high durability by using **Write-Ahead Logging (WAL)**, **multi-AZ synchronous replication**, and **erasure coding in object storage** to protect against hardware failure.
