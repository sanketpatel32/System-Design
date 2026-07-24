# Design LinkedIn Feed
> **Category:** Intermediate System Design Problems

---

### Overview
**LinkedIn Feed** is a professional news feed system delivering posts, long-form articles, job updates, and network achievements with multi-degree connection fanout, professional graph filtering, and spam detection.

### Architecture Topology Diagram

```
+---------------+     1. POST /v1/posts     +-------------------+
| Client App    | ------------------------> | API Gateway       |
+---------------+                           +-------------------+
        ^                                             |
        | 4. Fetch Ranked Feed                        v 2. Content Quality Pipeline
        v                                   +-------------------+
+-------------------+                       | Content Ingestion | ---> [ Spam / Abuse Filter ]
| Feed Aggregator   |                       +-------------------+
+-------------------+                                 |
        |                                             v 3. Graph Fanout
        | 5. Aggregate & Sort                 +-------------------+
        +-----------------------------------> | Economic Graph    |
                                              | (Connection Index)|
                                              +-------------------+
```

### Social Graph Degree Fanout Rules

| Connection Layer | Fanout Mechanism | Weight in Feed |
|---|---|---|
| **1st Degree (Direct Connections)** | Direct Push to Feed Cache | **High** precedence |
| **2nd / 3rd Degree (Network Activity)**| Activity-triggered Pull (e.g. "Friend liked this") | **Medium** precedence |
| **Followed Hashtags / Company Pages** | Pub/Sub Topic Subscription | **High** precedence |

### Candidate Retrieval & Ranking Pipeline

| Pipeline Phase | Operations Executed | Output Count |
|---|---|---|
| **1. Candidate Retrieval** | Fetch latest activity from 1st degree network + company pages | ~1,000 candidates |
| **2. Spam & Quality Filter**| Evaluate text against spam classifiers (low-quality / viral bait)| ~800 clean posts |
| **3. Machine Learning Scoring**| Score CTR, Virality, Professional Relevance using XGBoost / Neural Net | Top 50 Ranked Feed |

### Key takeaway
LinkedIn Feed relies on **multi-degree Economic Graph fanout** filtered through a real-time **spam/quality classifier** before ranking candidate items via professional relevance scoring engines.
