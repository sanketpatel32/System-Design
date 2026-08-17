# Design Facebook News Feed
> **Category:** Intermediate System Design Problems

---

### Overview
**Facebook News Feed** aggregates, ranks, and customizes posts, photos, videos, and status updates from a user's social graph (friends, joined groups, followed pages).

Unlike simple chronological feeds, News Feed relies on **Machine Learning Ranking Engines** (derived from the historic EdgeRank formula) to calculate a personalized relevance score for thousands of potential feed items in real time.

### System Architecture & ML Feed Generation Topology

```
+------------------+     1. GET /v1/newsfeed                +--------------------+
| Client App       | -------------------------------------> | Web API Gateway    |
+------------------+                                        +--------------------+
                                                                      |
                                                                      v 2. Fetch Candidate Posts
                                                            +--------------------+
                                                            | Graph Service &    |
                                                            | Feed Fetcher       |
                                                            +--------------------+
                                                                      |
                                                                      v 3. Candidate Pool (1000 posts)
                                                            +--------------------+
                                                            | Machine Learning   |
                                                            | Feed Ranker Engine |
                                                            +--------------------+
                                                                      |
                                                                      v 4. Score & Order Top 20
                                                            +--------------------+
                                                            | Redis Feed Cache   |
                                                            +--------------------+
```

### Key Technical Mechanics & Ranking Scoring Function
The News Feed Ranking Engine scores candidate posts using a multi-factor prediction model:

Score(u, p) = wₐffinity · A(u, a) + w_weight · W(p) + w_decay · e⁻λ · Δ t

- **Affinity Score A(u, a):** Strength of relationship between user u and post author a (frequency of messages, tag interactions, profile visits).
- **Weight Score W(p):** Post engagement type (video uploads and multi-photo posts weighted higher than plain text).
- **Time Decay e⁻λ · Δ t:** Exponential decay factor favoring recent posts over older content.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/newsfeed` | GET | `{"user_id": "u_881", "cursor": "cur_99", "limit": 10}` | `{"feed_items": [{"post_id": "p_99", "author": "Alice", "score": 98.4}], "cursor": "cur_100"}` |
| `/api/v1/newsfeed/feedback`| POST | `{"post_id": "p_99", "action": "HIDE_POST"}` | `{"status": "UPDATED", "message": "Feedback ingested for ranker model"}` |

### News Feed Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `post_id` | UUID | Cassandra / TAO (Graph DB) | Primary Key for post metadata. |
| `user_id` | String | TAO Graph Engine | Author ID. |
| `affinity_score` | Float | Redis Cache | Pre-calculated user-to-user affinity metric. |
| `feed_cache:{user_id}`| Redis Sorted Set | Redis Cache | Ranked candidate post IDs score-sorted by ML Ranker. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Two-Stage Retrieval (Candidate Retrieval + ML Ranker)**| Narrows millions of graph posts down to top 1,000 before running heavy ML inference models. | Requires maintaining dual infrastructure (fast candidate indexer + GPU/CPU ML inference nodes). | High-scale personalized feed generation platforms. |
| **TAO Distributed Graph Store** | Optimized sub-millisecond edge traversal for user-friend relationships. | High memory footprint; complex multi-datacenter consistency management. | Social graph queries with deep relational connections. |
| **Real-Time Impression Feedback Loop**| Immediately adjusts feed ranking if a user hides or quickly scrolls past a post. | High write volume to analytics logging stream (Kafka). | ML-driven news feed personalization engines. |

### Key takeaway
**Facebook News Feed** uses a **Two-Stage Retrieval Pipeline** (fast graph candidate fetch + ML scoring model) to rank candidate posts based on user affinity, post engagement weight, and exponential time decay.
