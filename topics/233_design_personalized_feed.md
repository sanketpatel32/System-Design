# Design Personalized Feed
> **Category:** Search and Recommendation Systems

---

### Overview
A **Personalized Feed** (e.g., TikTok For You Page, YouTube Home Feed, Instagram Explore) constructs an infinite, real-time scrollable content feed customized to an individual user's implicit interests, history, and real-time interaction signals.

The platform combines real-time user state tracking, **Multi-Armed Bandit Exploration**, deep neural ranking models, and sub-100ms item delivery.

### System Architecture & Personalized Feed Topology

```
+--------------------------------------------------------------------------+
| USER MOBILE CLIENT (App Request: GET /api/v1/feed)                       |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Fetch Request
+--------------------------------------------------------------------------+
| FEED ENGINE GATEWAY & REAL-TIME STATE CONTEXT                            |
|  [ User Interest Vector ] + [ Session Context (Last 5 Swipes/Clicks) ]  |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Retrieve Candidate Items
+--------------------------------------------------------------------------+
| CANDIDATE VECTOR STORE (FAISS / ScaNN Vector Search over Item Index)     |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Deep ML Score & Rank
+--------------------------------------------------------------------------+
| NEURAL RANKING ENGINE (Predicts Engagement: Like, Watch > 80%, Share)    |
+--------------------------------------------------------------------------+
                                     |
                                     v 4. Explore vs Exploit Balancing
+--------------------------------------------------------------------------+
| MULTI-ARMED BANDIT ENGINE (Injects 10% Exploration Items)                |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Real-Time Session Context Feature Store:** Tracks micro-interactions (e.g., user watched 90% of a cooking video, skipped a sports video after 1 second). Updates the user's active session vector in Redis within **500 milliseconds**.
2. **Multi-Armed Bandit Exploration ($\epsilon$-greedy):** Allocates 90% of feed slots to high-confidence interest items (Exploitation) and 10% to random new categories (Exploration) to discover new user interests and prevent feed fatigue.
3. **Multi-Task Neural Network Scoring:** Predicts distinct interaction probabilities simultaneously:

$$\text{Feed Score} = w_1 \cdot P(\text{Watch}) + w_2 \cdot P(\text{Like}) + w_3 \cdot P(\text{Share}) - w_4 \cdot P(\text{Skip})$$

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/feed/personalized`| GET | `{"user_id": "u_881", "session_id": "sess_99", "limit": 10}` | `{"items": [{"item_id": "v_104", "type": "VIDEO", "exp_group": "EXPLOIT"}]}` |
| `/api/v1/feed/impression` | POST | `{"user_id": "u_881", "item_id": "v_104", "watch_time_ms": 14200, "completed": true}` | Flushes real-time feature event to Kafka. |

### Personalized Feed Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `user_id` | String | Feature Store (Redis) | Primary Key for user profile state. |
| `user_interest_vector`| Array of Floats (256d)| Vector DB | Real-time dense embedding capturing long-term and short-term interests. |
| `seen_items_bloom` | Bloom Filter | Redis Cache | Per-user Bloom filter preventing previously seen feed items from re-appearing. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Real-Time In-Session Vector Updates** | Feed adapts instantly within seconds to what the user is currently watching. | Heavy write volume to Redis feature stores and stream processing workers. | Short-video feeds (TikTok, YouTube Shorts). |
| **Multi-Task Neural Network Ranking** | Balances multiple engagement goals (watch time vs likes vs shares). | Requires complex multi-loss GPU training pipelines. | Advanced personalized media feeds. |
| **Per-User Bloom Filter Deduplication** | Guarantees users never see duplicate items in their feed; minimal memory usage. | Bloom filter false positives may occasionally block an unseen item. | Infinite scroll personalized feeds. |

### Key takeaway
A **Personalized Feed** delivers real-time engagement by updating user interest vectors in **Redis sub-second feature stores**, ranking candidate items via **Multi-Task Neural Networks**, and using **Multi-Armed Bandits** to balance content exploitation with interest exploration.
