# Estimate Requests Per Second

> **Category:** Back-of-the-Envelope Estimation

---

Estimating **Requests Per Second (RPS)** or **Queries Per Second (QPS)** converts daily user activity into a continuous throughput metric required to size application compute nodes, load balancers, and database clusters.

### RPS Conversion Pipeline

```
+-------------------------------------------------------------------------+
|                        RPS CONVERSION PIPELINE                          |
+-------------------------------------------------------------------------+

  [ Daily Active Users (DAU) ]  ---> (e.g., 100 Million)
               |
               v (Requests per user/day ~ 20)
  [ Total Daily Requests ]      ---> (100M * 20 = 2 Billion requests/day)
               |
               v (Divide by 86,400 seconds/day ≈ 100,000 for mental math)
  [ Average RPS / QPS ]         ---> (2 Billion / 100,000 = 20,000 QPS)
```

### Estimation Constants & Mental Math Cheat Sheet

| Metric / Unit | Exact Value | Interview Approximation | Why Use Approximation? |
| :--- | :--- | :--- | :--- |
| **Seconds per Day** | 86,400 seconds | **100,000 ($10^5$) seconds** | Simplifies division by orders of magnitude |
| **Seconds per Month** | 2,592,000 seconds | **2.5 Million ($2.5 \times 10^6$) seconds**| Fast mental math for monthly totals |
| **1 Million ($10^6$) / 100,000**| 11.57 requests/sec | **10 QPS** | Quick mental baseline |
| **1 Billion ($10^9$) / 100,000**| 11,574 requests/sec| **10,000 QPS** | Standard enterprise throughput scale |

### Step-by-Step Mathematical Calculation

1. **Calculate Total Daily Volume**:
   - Given $\text{DAU} = 100\,\text{Million}$
   - Average user actions per day $= 20$ (e.g., 15 reads, 5 writes)

$$\text{Total Daily Requests} = 100\,\text{M} \times 20 = 2\,\text{Billion requests/day}$$

2. **Convert Daily Volume to Average RPS**:

$$\text{Average RPS} = \frac{\text{Total Requests per Day}}{86,400} \approx \frac{2,000,000,000}{100,000} = 20,000\,\text{RPS}$$

3. **Separate Read RPS vs. Write RPS**:
   - If Read:Write ratio is $3:1$ (75% reads, 25% writes):

$$\text{Read QPS} = 20,000 \times 0.75 = 15,000\,\text{Read QPS}$$

$$\text{Write QPS} = 20,000 \times 0.25 = 5,000\,\text{Write QPS}$$

### Key takeaway

To calculate Average RPS, convert daily volume by dividing total daily requests by **$100,000$ (86,400 exact)**. Always split total RPS into **Read QPS vs. Write QPS** to properly design database caching and storage layers.
