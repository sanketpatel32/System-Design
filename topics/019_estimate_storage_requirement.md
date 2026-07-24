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
| **Kilobyte (KB)** | $1,024$ bytes | $\approx 10^3$ bytes | Small text snippet, metadata JSON |
| **Megabyte (MB)** | $1,024$ KB | $\approx 10^6$ bytes | High-res photo, short audio clip |
| **Gigabyte (GB)** | $1,024$ MB | $\approx 10^9$ bytes | 1 hour HD video stream |
| **Terabyte (TB)** | $1,024$ GB | $\approx 10^{12}$ bytes | Enterprise DB tables, small log cluster |
| **Petabyte (PB)** | $1,024$ TB | $\approx 10^{15}$ bytes | Web-scale data warehouse (S3 object store) |

### Step-by-Step Storage Estimation Walkthrough

1. **Define Schema Field Sizes**:
   - `user_id` (UUID): 16 bytes
   - `tweet_id` (64-bit int): 8 bytes
   - `tweet_text` (UTF-8 string, max 280 chars): ~300 bytes
   - `created_at` (Timestamp): 8 bytes
   - `metadata` (JSON): ~100 bytes
   - **Total record size**: $\approx 500\text{ bytes per tweet}$.

2. **Calculate Daily Storage Volume**:
   - Given $100\,\text{Million new tweets posted per day}$:

$$\text{Daily Raw Storage} = 100\,\text{M records} \times 500\,\text{Bytes} = 50,000,000,000\,\text{Bytes} = 50\,\text{GB/day}$$

3. **Calculate 5-Year Total Storage Capacity**:

$$\text{5-Year Storage} = 50\,\text{GB/day} \times 365\,\text{days} \times 5\,\text{years} = 91,250\,\text{GB} \approx 91.25\,\text{TB}$$

4. **Account for Indexes and Replication Redundancy**:
   - Index overhead (+20%): $91.25\,\text{TB} \times 1.20 = 109.5\,\text{TB}$.
   - Triple replication ($3\times$ redundancy for fault tolerance):

$$\text{Total Infrastructure Storage Required} = 109.5\,\text{TB} \times 3 \approx 328.5\,\text{TB}$$

### Key takeaway

Always calculate storage requirements over a **5-year horizon**. Include all schema fields, apply an **index overhead factor (typically +20%)**, and multiply by **replication factor ($3\times$)** to size real physical storage hardware.
