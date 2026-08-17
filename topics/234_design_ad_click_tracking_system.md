# Design Ad Click Tracking System
> **Category:** Search and Recommendation Systems

---

### Overview
An **Ad Click Tracking System** records, verifies, aggregates, and bills digital advertising clicks (e.g., Google Ads, Meta Ads) generating billions of dollars in revenue.

Because financial billing depends directly on click logs, the system demands **strict Exactly-Once Processing guarantees**, sub-second fraud/bot click filtering, high-throughput stream ingestion, and real-time advertiser budget reconciliation.

### System Architecture & Exactly-Once Pipeline Topology

```
+--------------------------------------------------------------------------+
| USER BROWSER / AD PLACEMENT (User clicks ad link)                         |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. GET /api/v1/ad/click?ad_id=104&token=nonce_99
+--------------------------------------------------------------------------+
| AD CLICK INGESTION GATEWAY                                               |
| Encrypts & Verifies Click Token Nonce / Redirects User to Advertiser Site|
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Stream Click Event
+--------------------------------------------------------------------------+
| KAFKA EVENT STREAM BUFFER (Partitioned by Ad ID / Advertiser ID)          |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Exactly-Once Processing & Fraud Filtering
+--------------------------------------------------------------------------+
| APACHE FLINK STREAM ENGINE + REDIS IDEMPOTENCY CHECK                     |
|  [ Fraud Bot Filter ] --> [ Deduplication Engine ] --> [ Budget Aggregator]|
+--------------------------------------------------------------------------+
                                     |
                                     v 4. Financial Billing Update
+--------------------------------------------------------------------------+
| ADVERTISER BILLING DATABASE (ClickHouse / CockroachDB Ledger)            |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Exactly-Once Processing Guarantee:** Combines **Kafka Idempotent Producers**, **Apache Flink Two-Phase Commit Checkpoints**, and **Redis Idempotency Nonces** (`SETNX click_nonce:{id}`) to guarantee that network retries never double-bill advertisers for a single click.
2. **Fraud & Bot Click Detection:** Filters invalid clicks (double clicks, crawler bots, IP click farms) using real-time IP rate limiting, browser fingerprint verification, and machine learning anomaly scoring before billing occurs.
3. **Real-Time Advertiser Budget Depletion:** Aggregates click costs (CPC) in Flink streaming windows, updating advertiser balance caches in Redis to automatically pause ad campaigns when daily budgets are exhausted.

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/ad/click` | GET | `ad_id=104`, `impression_id=imp_99`, `token=tok_881a` | `HTTP 302 Found` with `Location: https://advertiser.com/landing` |
| `/api/v1/billing/summary`| GET | `advertiser_id=adv_44` | `{"spent_today": 450.20, "clicks_valid": 900, "clicks_fraudulent": 42}` |

### Ad Click Ledger Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `click_id` / `nonce` | String (Primary Key)| Redis / ClickHouse | Cryptographic single-use nonce for idempotency deduplication. |
| `ad_id` | String (Indexed) | ClickHouse / PostgreSQL | Targeted advertisement campaign ID. |
| `advertiser_id` | String | ClickHouse | Owner billing account ID. |
| `cost_per_click (cpc)`| Decimal | ClickHouse | Financial charge amount for the valid click. |
| `is_valid` | Boolean | ClickHouse | Flag indicating if click passed fraud detection filters. |
| `ip_address` | String | ClickHouse | Client IP address used for fraud velocity tracking. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Exactly-Once Stream Processing (Flink 2PC)**| Guarantees 100% financial billing accuracy; eliminates double billing. | Increases processing latency slightly due to two-phase commit checkpointing. | Mandatory for all ad click billing and financial ledger systems. |
| **Single-Use Cryptographic Click Nonce** | Completely prevents replay attacks and duplicate HTTP request retries. | Requires storing active nonces in Redis cache until token window expires. | High-security ad tracking gateways. |
| **Real-Time Budget Caching in Redis** | Pauses ad campaigns within seconds of budget exhaustion, preventing over-spend. | Cache failover sync lag could allow minor budget overruns (< 1%). | Digital advertising campaign management engines. |

### Key takeaway
An **Ad Click Tracking System** protects financial billing integrity using **Exactly-Once Stream Processing (Kafka + Apache Flink)**, single-use **Redis Idempotency Nonces**, and real-time **Fraud Detection Engines** to filter invalid bot clicks.
