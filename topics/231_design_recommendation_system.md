# Design Recommendation System
> **Category:** Search and Recommendation Systems

---

### Overview
A **Recommendation System** (e.g., Netflix Movie Recommendations, Amazon Product Recommendations, TikTok Video Feed) filters millions of candidate items down to a personalized list of high-affinity items for each user in real time (< 100ms).

Industrial recommendation architectures adopt a three-tier funnel design: **Candidate Generation (Retrieval)** arrow **Scoring & Ranking** arrow **Re-Ranking & Diversity Filtering**.

### System Architecture & Recommendation Funnel Topology

```
+--------------------------------------------------------------------------+
| MILLIONS OF CANDIDATE ITEMS (Catalog: 10,000,000 Products / Movies)       |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Candidate Generation / Retrieval (Reduces to 1,000 Items)
+--------------------------------------------------------------------------+
| CANDIDATE GENERATOR (Two-Tower Neural Networks / Collaborative Filtering) |
|  [ User Vector ]  <--- (Cosine Similarity) --->  [ Item Vectors ]        |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Heavy ML Scoring & Ranking (Reduces to 100 Items)
+--------------------------------------------------------------------------+
| DEEP RANKING MODEL (Wide & Deep / DLRM Model / XGBoost Inference)        |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Business Rules & Diversity Filtering (Final 10 Items)
+--------------------------------------------------------------------------+
| RE-RANKER & DIVERSITY FILTER (Deduplication, Business Boost, Freshness)  |
+--------------------------------------------------------------------------+
                                     |
                                     v 4. Return Top 10 Personalized Recommendations
+--------------------------------------------------------------------------+
| USER APPLICATION                                                         |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Candidate Generation (Retrieval Stage):** Uses **Two-Tower Neural Networks** (User Tower + Item Tower) to map users and items into a shared 128-dimensional embedding space. Ann (Approximate Nearest Neighbor) search (FAISS / ScaNN) retrieves top 1,000 candidates in < 10ms.
2. **Heavy Ranking Stage:** Evaluates complex features (user history, item properties, context: time, device) using deep learning models (Wide & Deep, DLRM) to predict P(Click) or P(Watch).
3. **Re-Ranking & Diversity Stage:** Prevents recommending 10 items of the exact same category by enforcing intra-list diversity filters and injecting fresh items via Multi-Armed Bandits (ε-greedy).

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/recommendations` | POST | `{"user_id": "u_991", "context": {"device": "mobile", "country": "US"}, "limit": 10}` | `{"items": [{"item_id": "item_44", "score": 0.942, "reason": "Because you watched Inception"}]}` |
| `/api/v1/feedback` | POST | `{"user_id": "u_991", "item_id": "item_44", "event": "CLICK"}` | Enqueues interaction event into Kafka for real-time model feature stores. |

### Recommendation Feature Store & Vector Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `user_id` | String | Redis Feature Store / Feast | Primary Key for user profile. |
| `user_embedding` | Array of Floats (128d) | Vector DB (FAISS / ScaNN) | Dense vector embedding representing user preferences. |
| `item_embedding` | Array of Floats (128d) | Vector DB | Dense vector embedding representing item characteristics. |
| `recent_clicks` | JSON Array | Redis Cache | Short-term real-time user context features. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Three-Tier Funnel Architecture** | Decouples fast candidate retrieval (10ms) from heavy ML ranking inference (50ms). | Infrastructure complexity maintaining vector databases, feature stores, and ML inference clusters. | Industry-standard recommendation engines at scale. |
| **Two-Tower Vector Embeddings** | Extremely fast sub-10ms Approximate Nearest Neighbor (ANN) search across millions of items. | Cold-start problem for newly published items that lack interaction training data. | Large candidate catalog retrieval. |
| **Multi-Armed Bandit Exploration (ε-greedy)**| Discovers new user preferences and prevents recommendation echo chambers. | Small percentage of recommendations shown to users may have lower immediate click-through rates. | Personalized feed discovery and news platforms. |

### Key takeaway
A **Recommendation System** scales by filtering millions of catalog items through a **Three-Tier Funnel** (Two-Tower Vector Retrieval arrow Wide & Deep ML Ranking arrow Diversity Re-Ranking) under 100ms.
