# Estimate Storage Requirement

> **Category:** Back-of-the-Envelope Estimation

---

Storage estimate sizes your database, retention policy, and monthly cloud bill.

### Formula
```
Storage/day = new_records/day × avg_record_size
Storage/year = storage/day × 365
Total = storage/year × retention_years
```

### Bytes cheat sheet
| Type | Avg size |
|------|----------|
| Tweet (text + metadata) | 200-500 B |
| Image thumbnail | 5-20 KB |
| Photo (full) | 200 KB - 2 MB |
| Short video clip | 5-50 MB |
| Log line | 200-500 B |
| Metrics data point | 50-100 B |
| Database row | 1-4 KB |

### Worked example — Twitter
- 500M tweets/day × 300B avg = 150 GB/day
- × 365 = 55 TB/year
- + indexes (2-3x) → ~150 TB/year
- × 5-year retention = ~750 TB

### Multipliers to remember
- **Indexes**: typically 2-3x the raw data.
- **Replication**: 3x for production (3 copies).
- **Backups**: +1-2x of total.
- **Overhead**: leave 30-50% headroom.

### Storage tiers
- **Hot** (SSD, frequent access) — expensive.
- **Warm** (HDD or cheaper SSD) — moderate.
- **Cold / archive** (S3 Glacier) — cheap, slow.

### Key takeaway
Multiply: **records/day × size × 365 × retention × replication**. Then apply the 3x rule (indexes
+ replicas + headroom).
