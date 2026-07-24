# Design Facebook News Feed
> **Category:** Intermediate System Design Problems

---

### Overview
**Facebook News Feed** is a constantly updating stream of stories (status updates, photos, videos, activity) tailored to each user based on complex Machine Learning relevance ranking algorithms.

### System Architecture Pipeline

```
+--------+     1. GET /v1/feed     +-------------------+
| Client | ----------------------> | API Gateway       |
+--------+                         +-------------------+
    ^                                        |
    | 5. Return Top 50 Ranked Stories        v 2. Trigger Generation
    |                              +-------------------+
    | <--------------------------- | Feed Service      |
    |                              +-------------------+
    |                                 /             \
    |            3. Fetch Candidates /               \ 4. Rank Candidates
    |                               v                 v
    |                     +-------------------+  +-------------------+
    |                     | Candidate Storage |  | ML Ranking Engine |
    |                     | (Tao Graph Cache) |  | (EdgeRank / DLRM) |
    |                     +-------------------+  +-------------------+
```

### Core API Specification

| Endpoint | Method | Parameters | Response |
|---|---|---|---|
| `/api/v1/feed` | `GET` | `?user_id=123&cursor=xyz&limit=20` | `200 OK` -> `{"stories": [...], "next_cursor": "..."}` |
| `/api/v1/feed/action` | `POST` | `{"story_id": "s_99", "action": "LIKE"}` | `200 OK` -> `{"status": "SUCCESS"}` |

### Story Ranking ML Pipeline (EdgeRank / Deep Learning)

$$S = w_u \cdot U + w_d \cdot D + w_t \cdot T + w_r \cdot R$$

| Scoring Factor | Description | Measurement |
|---|---|---|
| **Affinity Score ($U$)** | User's historical interaction with author | Likes, comments, messages shared between pair |
| **Weight ($W$)** | Weight of interaction type | Comment (High) > Like (Medium) > Click (Low) |
| **Time Decay ($T$)** | Recency of story | Inverse exponential decay $e^{-\lambda \Delta t}$ |
| **Relevance Score ($R$)**| ML prediction of user click-through rate (CTR) | Deep Learning Recommendation Model (DLRM) |

### Distributed Social Graph Storage (Facebook TAO System)
- **Nodes**: Users, Pages, Posts, Comments.
- **Edges**: Follows, Authored, Liked, Tagged.
- **TAO Read/Write Cache Layer**: Distributed in-memory write-through cache sitting in front of MySQL database shards.

### Key takeaway
Facebook News Feed decouples candidate retrieval from ranking. Use a **distributed graph cache (TAO)** to fetch candidate stories from friends and a real-time **ML Ranking Engine (DLRM)** to score and sort the top items.
