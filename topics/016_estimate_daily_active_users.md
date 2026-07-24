# Estimate Daily Active Users

> **Category:** Back-of-the-Envelope Estimation

---

Estimating **Daily Active Users (DAU)** and **Monthly Active Users (MAU)** is the foundational starting point for back-of-the-envelope estimations in System Design. DAU provides the operational baseline from which all downstream capacity requirements—QPS, bandwidth, database storage, and server counts—are derived.

### User Traffic Estimation Flow

```
+-------------------------------------------------------------------------+
|                      USER TRAFFIC ESTIMATION FLOW                       |
+-------------------------------------------------------------------------+

  [ Total Registered Users ] ---> (e.g., 500 Million)
             |
             v (Engagement Ratio DAU/MAU ~ 50%)
  [ Monthly Active Users (MAU) ] ---> (e.g., 200 Million)
             |
             v (Daily Active Factor ~ 50% of MAU)
  [ Daily Active Users (DAU) ]   ---> (e.g., 100 Million DAU)
             |
             v (Actions per user/day ~ 20 operations)
  [ Daily Total Requests ]      ---> (e.g., 2 Billion requests/day)
```

### Typical DAU/MAU Ratios Across Industry Domains

| Product Category | DAU / MAU Ratio | Typical User Actions / Day | Industry Examples |
| :--- | :--- | :--- | :--- |
| **Social Media & Messaging** | 50% - 70% (High Engagement) | 20 - 50 actions | WhatsApp, Twitter/X, Instagram |
| **E-Commerce & Retail** | 10% - 20% (Periodic Use) | 5 - 10 actions | Amazon, eBay, Shopify stores |
| **Ride Sharing & Delivery** | 15% - 30% (Demand Driven) | 2 - 4 actions | Uber, DoorDash, Lyft |
| **B2B Productivity SaaS** | 40% - 60% (Workday Heavy) | 50 - 100 actions | Slack, Jira, Notion |
| **Media Streaming** | 25% - 40% (Evening Peak) | 3 - 8 actions | Netflix, YouTube, Spotify |

### Step-by-Step Estimation Walkthrough

1. **Start with MAU or Total User Base**: If given 300 Million MAU for a global application:
2. **Apply DAU/MAU Engagement Factor**: 

$$\text{DAU} = \text{MAU} \times 0.50 = 300\,\text{M} \times 0.50 = 150\,\text{Million DAU}$$

3. **Calculate Total Requests per Day**: If an average user performs 10 read/write operations daily:

$$\text{Total Daily Requests} = 150\,\text{M DAU} \times 10\,\frac{\text{requests}}{\text{user}} = 1.5\,\text{Billion Requests/Day}$$

### Key takeaway

DAU forms the foundation for all capacity calculations. Multiply MAU by the engagement factor (typically 50% for consumer platforms) to establish DAU, then derive total daily requests to drive server, database, and bandwidth planning.
