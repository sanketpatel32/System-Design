# Backup and Restore

> **Category:** Reliability and Fault Tolerance

---

Backups = **copies of data stored separately, used to recover after loss or corruption.**

### Why backup
- Hardware failure.
- Bug / accidental deletion.
- Ransomware.
- Region outage.
- Compliance / audit.

### Types

#### Full backup
- Complete copy of everything.
- Slow to take, fast to restore.
- Storage-heavy.

#### Incremental
- Only changes since last backup.
- Fast to take, slower to restore (chain of increments).

#### Differential
- Changes since last full backup.
- Compromise between full and incremental.

#### Continuous backup / PITR
- Point-in-time recovery: restore to any second.
- Via WAL streaming (Postgres) or CDC.

### 3-2-1 rule
- **3** copies of data.
- **2** different media types.
- **1** offsite (different region).

### Where to back up
- DB snapshots (RDS automated).
- Object storage replication (S3 cross-region).
- EBS snapshots.
- Volume-level backups.

### Testing
- **Untested backups = no backups.**
- Restore regularly to verify.
- Measure restore time (should match RTO).

### Retention
- Daily for 30 days.
- Weekly for 12 weeks.
- Monthly for years.
- Adjust to compliance requirements.

### Immutable backups
- Write-once, can't be modified/deleted (even by admin).
- Protection against ransomware.
- AWS Backup Vault Lock, S3 Object Lock.

### Key takeaway
Backups are your last line of defense. Follow the **3-2-1 rule**. Use **PITR** for granular
recovery. Make backups **immutable** to defeat ransomware. Test restores regularly — untested
backups are just hope.
