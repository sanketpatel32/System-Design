# Design Reddit
> **Category:** Intermediate System Design Problems

---

### Overview
**Reddit** is a community-driven news aggregation, discussion, and content rating platform structured into thousands of topic-specific communities called **Subreddits**. Users submit posts, vote (upvote/downvote), and participate in deeply nested comment threads.

Key technical challenges involve calculating real-time post ranking using the **Reddit Hot Algorithm**, supporting high-concurrency upvote/downvote operations, and rendering deeply nested comment trees.

### System Architecture & Reddit Topology

```
+------------------+     1. POST /r/systemdesign/comments   +--------------------+
| Client Browser   | -------------------------------------> | API Gateway        |
+------------------+                                        +--------------------+
                                                                      |
                                                                      | 2. Vote & Comment Events
                                                                      v
                                                            +--------------------+
                                                            | Reddit Core App    |
                                                            | Service            |
                                                            +--------------------+
                                                              /                \
                                       3. Atomic Vote Count  /                  \ 4. Fetch Comment Tree
                                                            v                    v
                                                   +--------------------+  +--------------------+
                                                   | Vote Cache (Redis) |  | Cassandra DB       |
                                                   | & Hot Ranker       |  | (Closure Table DB) |
                                                   +--------------------+  +--------------------+
```

### Key Technical Mechanics
1. **Reddit Hot Ranking Algorithm:** Computes post score $S$ based on upvotes $U$, downvotes $D$, and submission epoch time:

$$w = U - D$$

$$x = egin{cases} 1 & 	ext{if } w > 0 \ -1 & 	ext{if } w < 0 \ 0 & 	ext{if } w = 0 \end{cases}$$

$$S(w, t) = \log_{10}(\max(|w|, 1)) + rac{x \cdot (t - t_0)}{45000}$$

*Key Insight:* The logarithmic scale $\log_{10}(|w|)$ means the first 10 votes have the same ranking impact as the next 100 votes, and $45000$ seconds (12.5 hours) naturally degrades older posts to keep the homepage fresh.

2. **Nested Comment Tree Storage (Path Enumeration / Closure Table):** Stores tree hierarchy using materialized path strings (e.g., `path: "root/c1/c4/c9"`) to allow querying entire nested discussion threads in a single database read.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/r/{subreddit}/hot`| GET | `{"limit": 25, "after": "t3_991"}` | `{"posts": [{"id": "t3_991", "title": "System Design Guide", "score": 1420}]}` |
| `/api/v1/vote` | POST | `{"id": "t3_991", "direction": 1}` | `{"status": "SUCCESS", "new_score": 1421}` |
| `/api/v1/comments/{post_id}`| GET | None | `{"comment_tree": [{"id": "c_1", "path": "c_1", "children": [...]}]}` |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `post_id` | String (Prefix `t3_`) | Cassandra / PostgreSQL | Unique Thing ID. |
| `subreddit_id` | String (Prefix `t5_`) | Relational DB | Parent Subreddit community ID. |
| `upvotes` / `downvotes`| Counter | Redis / Cassandra | Distributed atomic vote counters. |
| `hot_score` | Double | Redis ZSET | Pre-computed score powering subreddit Hot listing. |
| `comment_path` | String (Path) | Cassandra | Materialized path (`root/c1/c4`) for single-query tree retrieval. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Reddit Hot Logarithmic Time Decay**| Gives huge early boost to breaking posts while guaranteeing 12-hour content rotation. | Older posts with 50,000+ votes eventually drop off front page completely. | Community news aggregators and discussion boards. |
| **Materialized Path Comment Storage** | Fetches entire nested comment tree branch in 1 SQL/NoSQL query. | Moving a comment subtree requires updating path strings on all child nodes. | Deeply nested online forum discussion trees. |
| **Asynchronous Vote Batching in Redis**| Protects primary DB from write collapse during viral post voting bursts. | Real-time score displayed to users may lag by a few seconds. | High-volume voting platforms. |

### Key takeaway
**Reddit** maintains a fresh front page using the **Logarithmic Hot Algorithm** (balancing vote margin against a 12.5-hour time decay constant) and renders deeply nested comment threads using **Materialized Path Tree Storage**.
