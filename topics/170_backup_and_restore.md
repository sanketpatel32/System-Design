# Backup and Restore

> **Category:** Reliability and Fault Tolerance

---

Backup and Restore is the foundational data preservation pattern where **copies of database states and file stores are saved periodically** to isolated secondary storage targets to allow recovery from corruption or loss.

### Backup Strategy Architecture

```
+------------------------------------+       Continuous Write-Ahead Logs (WAL)      +-----------------------------+
| Production Database                | -------------------------------------------> | Point-In-Time Restore (PITR)|
+------------------------------------+                                              +-----------------------------+
    |                                                                                             ^
    | Daily Full Backup Snapshot                                                                  |
    v                                                                                             |
+------------------------------------+       Automated Lifecycle Rules                      +-----------------------------+
| Primary S3 Backup Bucket           | -------------------------------------------> | S3 Glacier Cold Archive     |
+------------------------------------+                                              +-----------------------------+
```

### Backup Modalities Comparison

| Modality | Description | Storage Size | Restore Speed | Recovery Granularity |
| :--- | :--- | :--- | :--- | :--- |
| **Full Backup** | Complete copy of all database blocks/files | Largest | Fast | Single point in time |
| **Incremental Backup** | Copies only blocks modified since last incremental | Smallest | Slowest (Requires applying full + all increments)| Specific incremental window |
| **Differential Backup**| Copies blocks modified since last full backup | Moderate | Moderate | Single differential delta |
| **Continuous WAL (PITR)**| Streams Write-Ahead Log segments continuously | Compact | Fast & Granular | Any exact second in time |

### Disaster Recovery Verification

- **Automated Restore Testing**: Backups are useless if restores fail; run automated nightly jobs that restore backup dumps to isolated test environments and execute sanity check queries.

### Key takeaway

Combine **daily full snapshots with continuous Write-Ahead Log (WAL) streaming** to enable granular Point-In-Time Recovery (PITR) while routinely auditing automated restores.
