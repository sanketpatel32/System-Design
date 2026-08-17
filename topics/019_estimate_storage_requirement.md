# Estimate Storage Requirement

> **Category:** Back-of-the-Envelope Estimation

---

Estimating **Storage Requirements** determines total disk capacity needed over time (typically calculated for **1 year** and **5 years**). It accounts for primary record data, media attachments, index overhead, and replication redundancy.

### Multi-Year Data Storage Accumulation Flow

```
+-------------------------------------------------------------------------+
|                  STORAGE ACCUMULATION PIPELINE                          |
+-------------------------------------------------------------------------+

  [ Daily Written Records ]  ---> (e.g., 50 Million Tweets / day)
              |
              v (Multiply by record size ~ 500 Bytes)
  [ Raw Daily Data Volume ]  ---> (50M * 500 B = 25 Gigabytes / day)
              |
              v (Multiply by 365 days + factor 3x for Replication / Indexes)
  [ Annual Storage Total ]   ---> (25 GB * 365 * 3 ≈ 27.3 Terabytes / year)
              |
              v (Multiply by 5 years)
  [ 5-Year Horizon Capacity] ---> (~136.5 Terabytes)
```

### Digital Storage Units Conversion Reference

| Unit | Exact Bytes | Scientific Notation | Practical Rule of Thumb |
| :--- | :--- | :--- | :--- |
| **Kilobyte (KB)** | 1,024 bytes | ≈ 10³ bytes | Small text snippet, metadata JSON |
| **Megabyte (MB)** | 1,024 KB | ≈ 10⁶ bytes | High-res photo, short audio clip |
| **Gigabyte (GB)** | 1,024 MB | ≈ 10⁹ bytes | 1 hour HD video stream |
| **Terabyte (TB)** | 1,024 GB | ≈ 10¹² bytes | Enterprise DB tables, small log cluster |
| **Petabyte (PB)** | 1,024 TB | ≈ 10¹⁵ bytes | Web-scale data warehouse (S3 object store) |

### Step-by-Step Storage Estimation Walkthrough

1. **Define Schema Field Sizes**:
   - `user_id` (UUID): 16 bytes
   - `tweet_id` (64-bit int): 8 bytes
   - `tweet_text` (UTF-8 string, max 280 chars): ~300 bytes
   - `created_at` (Timestamp): 8 bytes
   - `metadata` (JSON): ~100 bytes
   - **Total record size**: ≈ 500 bytes per tweet.

2. **Calculate Daily Storage Volume**:
   - Given 100 Million new tweets posted per day:

**Daily Raw Storage** = 100 M records × 500 Bytes = 50,000,000,000 Bytes = 50 GB/day

3. **Calculate 5-Year Total Storage Capacity**:

5-Year Storage = 50 GB/day × 365 days × 5 years = 91,250 GB ≈ 91.25 TB

4. **Account for Indexes and Replication Redundancy**:
   - Index overhead (+20%): 91.25 TB × 1.20 = 109.5 TB.
   - Triple replication (3× redundancy for fault tolerance):

**Total Infrastructure Storage Required** = 109.5 TB × 3 ≈ 328.5 TB

### Key takeaway

Always calculate storage requirements over a **5-year horizon**. Include all schema fields, apply an **index overhead factor (typically +20%)**, and multiply by **replication factor (3×)** to size real physical storage hardware.
