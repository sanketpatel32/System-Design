# Design Ad Click Tracking System
> **Category:** Search and Recommendation Systems

---

### Overview
An **Ad Click Tracking System** processes high-volume advertisement click events with exact-once processing guarantees, detecting click fraud, updating advertiser budgets, and generating accurate billing analytics.

### Architecture Topology Diagram

```
+--------+     1. Click Ad Redirect     +-------------------+
| Client | ---------------------------> | Ad Click Gateway  |
+--------+                               +-------------------+
    ^                                             |
    | 2. 302 Redirect to Advertiser               v 3. Log Raw Click Event
    +---------------------------------- +-------------------+
                                        | Kafka Event Bus   |
                                        +-------------------+
                                                  |
                                                  v 4. Exactly-Once Processing
                                        +-------------------+
                                        | Apache Flink      | ---> [ Fraud Detection Engine ]
                                        | Streaming Engine  |
                                        +-------------------+
                                                  |
                                                  v 5. Aggregate Billing & Aggregates
                                        +-------------------+
                                        | ClickHouse /      |
                                        | Druid OLAP DB     |
                                        +-------------------+
```

### Click Fraud Detection Signals

| Fraud Category | Detection Mechanism |
|---|---|
| **Duplicate Clicks** | De-duplicate identical `(user_id, ad_id)` clicks within a 5-minute sliding window. |
| **Bot Traffic** | Detect abnormal click rates per IP/Device Fingerprint via Flink window aggregations. |
| **Click Farms** | Blacklist IP ranges exhibiting zero post-click landing page engagement duration. |

### Real-Time OLAP Storage Engine (ClickHouse / Druid)
```sql
CREATE TABLE ad_clicks (
    click_id UUID,
    ad_id BIGINT,
    advertiser_id BIGINT,
    user_id VARCHAR,
    ip_address VARCHAR,
    cost_per_click DECIMAL(10,4),
    is_valid_click BOOLEAN,
    created_at DATETIME
) ENGINE = MergeTree()
ORDER BY (advertiser_id, ad_id, created_at);
```

### Key takeaway
Ad click tracking mandates **Exactly-Once Semantics (EOS)** using **Apache Kafka + Flink**, filtering click fraud using sliding windows before writing to **ClickHouse OLAP databases** for real-time advertiser billing.
