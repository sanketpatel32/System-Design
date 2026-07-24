# Estimate Peak QPS

> **Category:** Back-of-the-Envelope Estimation

---

**Peak Queries Per Second (Peak QPS)** estimates maximum traffic spikes caused by real-world usage patterns (e.g., morning check-ins, breaking news events, Flash Sales, or push notifications). Infrastructure must be provisioned for **Peak QPS**, not Average QPS, to prevent outages during traffic spikes.

### Traffic Spike vs. Average Load Visualization

```
+-------------------------------------------------------------------------+
|                    AVERAGE vs. PEAK QPS PROFILE                         |
+-------------------------------------------------------------------------+

  QPS
   ^
80k|                                        /\  <-- Peak QPS Spike (80k QPS)
   |                                       /  \     (Flash Sale / Push Notif)
40k|                   /\                 /    \
   |  ----------------/--\---------------/------\-----------------------
20k|  (Average QPS = 20k QPS)           /        \
   +--------------------------------------------------------------------> Time
      00:00        08:00              12:00      18:00         24:00
```

### Traffic Multiplier Benchmarks Across Industries

| Industry Domain | Typical Peak Multiplier | Cause of Traffic Spike | Standard Peak Handling Strategy |
| :--- | :--- | :--- | :--- |
| **Social Media / Messaging** | $2\times - 3\times$ | Evening active usage, breaking news | Elastic Auto-scaling, Edge CDNs |
| **Food Delivery / Mobility** | $3\times - 5\times$ | Lunch & dinner hours, sudden rain | Pre-warmed server fleets, surge pricing |
| **E-Commerce Flash Sales** | $5\times - 10\times$ | Product drop countdown timers | Queueing systems (Kafka), Rate Limiting |
| **Ticketing / Live Events** | $10\times - 50\times$ | Concert ticket sales release | Virtual Waiting Rooms, Static Caching |

### Peak QPS Calculation Formulas

1. **Calculate Average QPS**:

$$\text{Average QPS} = \frac{\text{Daily Total Requests}}{86,400}$$

2. **Apply Traffic Peak Multiplier**:

$$\text{Peak QPS} = \text{Average QPS} \times \text{Peak Multiplier}$$

### Concrete Numerical Walkthrough

- **Given**: $100\,\text{Million DAU}$, average $20$ requests/user/day.
- **Total Daily Requests**: $100\,\text{M} \times 20 = 2\,\text{Billion requests/day}$.
- **Average QPS**: $\frac{2,000,000,000}{100,000} = 20,000\,\text{QPS}$.
- **Peak Multiplier**: Assume $3\times$ traffic multiplier for peak evening hours.

$$\text{Peak QPS} = 20,000\,\text{QPS} \times 3 = 60,000\,\text{Peak QPS}$$

- If Read:Write ratio is $4:1$ (80% reads, 20% writes):

$$\text{Peak Read QPS} = 60,000 \times 0.80 = 48,000\,\text{QPS}$$

$$\text{Peak Write QPS} = 60,000 \times 0.20 = 12,000\,\text{QPS}$$

### Key takeaway

Never size system capacity for Average QPS. Provision application compute, load balancers, and database write throughput to support **Peak QPS** (typically **$2\times$ to $5\times$ Average QPS** depending on traffic patterns).
