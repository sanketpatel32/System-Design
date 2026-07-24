# Graceful Degradation

> **Category:** Reliability and Fault Tolerance

---

Graceful Degradation is a fallback design strategy where a system **intentionally disables non-essential features or reduces response quality** under heavy load or partial outages to keep core functionality operating.

### Dynamic Degradation Flow

```
+-----------------------------------------------------------------------------------+
|                            E-Commerce Homepage Request                            |
+-----------------------------------------------------------------------------------+
                                          |
    +-------------------------------------+-------------------------------------+
    | Core Services (Always Active)                                             | Secondary Services (Degradable)
    v                                                                           v
+-----------------------------------------+                 +-----------------------------------------+
| Product Catalog & Checkout              |                 | Personalized Recommendations           |
| (Database / Core API)                   |                 | (ML Recommendation Engine)              |
+-----------------------------------------+                 +-----------------------------------------+
    |                                                                           |
    | (Status: 200 OK)                                                          v (Status: Slow / Outage!)
    |                                                               +-----------------------------------------+
    |                                                               | Fallback to Static Bestsellers List     |
    v                                                               +-----------------------------------------+
+-------------------------------------------------------------------------------------------------------------+
| Renders Functional Homepage (Core Purchases Work; Recommendations Fallback to Static List)                   |
+-------------------------------------------------------------------------------------------------------------+
```

### Feature Tiers & Degradation Matrix

| Feature Tier | Service Examples | Degradation Behavior Under Load | Impact |
| :--- | :--- | :--- | :--- |
| **Tier 0 (Critical)** | Auth, Payment, Core Checkout | Never degraded; maximum resource priority | Zero system compromise |
| **Tier 1 (Important)**| Search, Order History | Serve from stale Redis cache | Minor data freshness delay |
| **Tier 2 (Secondary)**| Personalization, Analytics | Disable live ML; serve static defaults | Generic recommendation list |
| **Tier 3 (Optional)** | Live Chat Widget, User Badges | Completely drop component via feature flags | Visual UI omission |

### Implementation Techniques

- **Load Shedding**: Drop low-priority background jobs or analytics logging when CPU exceeds 85%.
- **Stale Cache Serving**: Return expired cached data (`stale-while-revalidate`) if backend DB read operations time out.

### Key takeaway

Design systems for **graceful degradation by categorizing feature criticality**, falling back to static defaults or cached data to keep core business workflows operational.
