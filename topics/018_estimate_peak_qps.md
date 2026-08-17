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
| **Social Media / Messaging** | 2× - 3× | Evening active usage, breaking news | Elastic Auto-scaling, Edge CDNs |
| **Food Delivery / Mobility** | 3× - 5× | Lunch & dinner hours, sudden rain | Pre-warmed server fleets, surge pricing |
| **E-Commerce Flash Sales** | 5× - 10× | Product drop countdown timers | Queueing systems (Kafka), Rate Limiting |
| **Ticketing / Live Events** | 10× - 50× | Concert ticket sales release | Virtual Waiting Rooms, Static Caching |

### Peak QPS Calculation Formulas

1. **Calculate Average QPS**:

**Average QPS** = (Daily Total Requests) / 86,400

2. **Apply Traffic Peak Multiplier**:

**Peak QPS** = Average QPS × Peak Multiplier

### Concrete Numerical Walkthrough

- **Given**: 100 Million DAU, average 20 requests/user/day.
- **Total Daily Requests**: 100 M × 20 = 2 Billion requests/day.
- **Average QPS**: 2,000,000,000 / 100,000 = 20,000 QPS.
- **Peak Multiplier**: Assume 3× traffic multiplier for peak evening hours.

**Peak QPS** = 20,000 QPS × 3 = 60,000 Peak QPS

- If Read:Write ratio is 4:1 (80% reads, 20% writes):

**Peak Read QPS** = 60,000 × 0.80 = 48,000 QPS

**Peak Write QPS** = 60,000 × 0.20 = 12,000 QPS

### Key takeaway

Never size system capacity for Average QPS. Provision application compute, load balancers, and database write throughput to support **Peak QPS** (typically **2× to 5× Average QPS** depending on traffic patterns).
