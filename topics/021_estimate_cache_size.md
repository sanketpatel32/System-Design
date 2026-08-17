# Estimate Cache Size

> **Category:** Back-of-the-Envelope Estimation

---

Estimating **Cache Size** determines the RAM memory needed to store hot data in memory stores (e.g., Redis or Memcached). A common benchmark applies the **80/20 Pareto Principle**: 20% of the data generates 80% of read traffic, so caching that hot 20% in RAM achieves an 80%+ cache hit ratio.

### Pareto 80/20 Caching Model

```
+-------------------------------------------------------------------------+
|                       PARETO 80/20 CACHING MODEL                        |
+-------------------------------------------------------------------------+

  [ Total Daily Read Requests ] (100% Volume)
                 |
                 v
  +-----------------------------------------------------------------------+
  |  IN-MEMORY CACHE TIER (REDIS / MEMCACHED RAM)                         |
  |  Stores Top 20% Hot Data Records ---> Serves 80% of Read Queries      |
  +-----------------------------------------------------------------------+
                 |
                 v (20% Miss Rate - Falls back to DB)
  +-----------------------------------------------------------------------+
  |  PRIMARY DATABASE STORAGE (NVME DISK)                                 |
  |  Stores 100% of Total Dataset                                         |
  +-----------------------------------------------------------------------+
```

### Cache Memory Sizing Parameters

| Metric Parameter | Description | Typical Enterprise Value |
| :--- | :--- | :--- |
| **Hot Data Ratio** | Percentage of active data requested repeatedly. | Pareto Rule: 20% of daily active dataset |
| **Cache Key-Value Size**| Combined byte size of cache key + serialized JSON payload. | 500 Bytes to 2 KB per item |
| **Cache TTL (Time To Live)**| Expiration duration of cached items. | 1 day (24 hours) for daily active cache |
| **Memory Overhead Factor**| RAM overhead for metadata, Redis dict pointers, fragmentation.| Multiply raw data size by **1.25× - 1.5×** |

### Step-by-Step Cache Calculation Walkthrough

1. **Calculate Daily Active Read Volume**:
   - Given 100 Million daily active requests.
   - Average size of cached entity (e.g., user profile payload) = 1 KB (1,000 Bytes).

2. **Calculate 100% Daily Read Dataset Size**:

**Total Daily Read Data** = 100 M requests × 1 KB = 100 GB/day

3. **Apply 80/20 Rule (Cache 20% Hot Data)**:

**Raw Cache Memory Required** = 100 GB × 0.20 = 20 GB of RAM

4. **Account for Memory Overhead & Safety Buffer (+25%)**:

**Total RAM Required** = 20 GB × 1.25 = 25 GB RAM

5. **Determine Redis Instance Fleet Size**:
   - If using 16 GB RAM cloud Redis instances, provision **2 instances** (2 × 16 GB = 32 GB total capacity) to allow headroom for spikes.

### Key takeaway

Size in-memory cache capacity by applying the **80/20 Pareto Principle** (cache 20% of daily read data). Add a **25-50% memory overhead factor** for Redis data structure pointers and TTL eviction management.
