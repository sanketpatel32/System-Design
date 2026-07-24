# Backup and Restore

> **Category:** Reliability and Fault Tolerance

---

Backup and restore is the foundational disaster recovery process of **creating point-in-time copies of data (Backups) and retrieving that data (Restore)** to recover from physical storage corruption, ransomware attacks, software bugs, or human operator error.

### Backup Types & Mechanics Architecture

Combining periodic full backups with continuous differential or transaction log backups optimizes storage usage while allowing point-in-time recovery.

```
Timeline of Backups:
Day 1 (Sunday)        Day 2 (Monday)        Day 3 (Tuesday)       Day 4 (Wednesday)
+---------------+     +---------------+     +---------------+     +---------------+
| Full Backup   |     | Diff Backup   |     | Diff Backup   |     | Full Backup   |
| (100 GB)      |     | (5 GB Change) |     | (12 GB Change)|     | (110 GB)      |
+---------------+     +---------------+     +---------------+     +---------------+
                                                |
                                          Ransomware Event!
                                                v
Restore Path: Restore Sunday Full Backup (100GB) + Apply Tuesday Diff Backup (12GB) = State Restored!
```

### Backup Types Comparison Matrix

| Backup Strategy | Storage Cost | Backup Time | Restore Speed | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Full Backup** | Highest | Slowest | Fastest | Complete copy of all database data files |
| **Incremental Backup**| Lowest | Fastest | Slowest | Copies only data changed since the *last backup* (Full or Incremental) |
| **Differential Backup**| Moderate | Moderate | Fast | Copies all data changed since the *last Full backup* |
| **Continuous WAL (PITR)**| Moderate | Continuous Stream | Precise | Streams write-ahead logs to object storage for Point-in-Time Recovery |

### Point-in-Time Recovery (PITR) Mechanics

Point-in-Time Recovery enables restoring a database to the exact millisecond before a catastrophic event (e.g. an unintended `DROP TABLE` executed at 14:02:11):
1. Restore the most recent **Full Database Snapshot** prior to 14:02:11.
2. Replay continuous **WAL (Write-Ahead Log) segments** sequentially up to log position `14:02:10.999`.
3. Stop replay before executing the destructive statement.

### Key Rules for Production Backup Management

- **The 3-2-1 Backup Rule**: Keep at least **3** copies of data, across **2** different storage media types, with **1** copy stored offsite/in a separate cloud region.
- **Test Restores Periodically**: An un-tested backup is not a backup. Automate weekly restoration verification scripts in isolated test environments.
### Automated Database Restore Verification Workflow

```
+----------------------------------------------------------------------------------------------------+
| Automated Weekly Backup Restoration Pipeline (CI/CD)                                                |
+----------------------------------------------------------------------------------------------------+
  1. Provision isolated ephemeral database container
  2. Download latest S3 Full Snapshot + Continuous WAL logs
  3. Execute Point-in-Time Recovery to test timestamp
  4. Run automated SQL assertions (`SELECT COUNT(*) FROM orders`) to verify table integrity
  5. Destroy test container & emit verification metric: `backup_restore_verification_status = SUCCESS`
```

### Key takeaway

Implement the **3-2-1 backup rule** and pair periodic full snapshots with continuous write-ahead log (WAL) streaming to enable precise Point-in-Time Recovery (PITR).
