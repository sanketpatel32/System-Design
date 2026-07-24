# Design Personalized Feed
> **Category:** Search and Recommendation Systems

---

### Overview
A **Personalized Feed System** merges activity from followed connections with algorithmic interest-based recommendations, assembling custom content feeds tailored to user preferences.

### System Architecture Topology

```
+--------+     1. GET /v1/feed/personalized     +-------------------+
| Client | -----------------------------------> | API Gateway       |
+--------+                                      +-------------------+
    ^                                                     |
    | 5. Return Top 50 Items                              v 2. Request Hybrid Candidates
    |                                           +-------------------+
    | <---------------------------------------- | Feed Orchestrator |
    |                                           +-------------------+
    |                                              /             \
    |            3. Social Follow Candidates (70%) /               \ 4. ML Recommendations (30%)
    |                                             v                 v
    |                                   +-------------------+  +-------------------+
    |                                   | Social Feed Cache |  | Recommendation DB |
    |                                   | (Redis ZSET)      |  | (Vector Index)    |
    |                                   +-------------------+  +-------------------+
```

### Hybrid Merging Ratio & Composition

| Composition Tier | Weight | Selection Logic |
|---|---|---|
| **Social Graph Items** | 70% | Recent posts from followed friends/pages sorted by recency |
| **Algorithmic Recommendations**| 20% | High-affinity content scored by vector embedding similarity |
| **Sponsored / Ads** | 10% | Targeted ads matched via demographic auction engine |

### Feed De-duplication & Interleaving
- **Bloom Filter**: Maintains local cache of post IDs rendered to user in current session to prevent duplicate display.
- **Interleaving Engine**: Merges social, recommended, and ad items into a cohesive feed array: `[Social, Social, Rec, Ad, Social, Rec, ...]`.

### Key takeaway
Personalized feeds combine **social graph updates** with **vector recommendations**. Use **Bloom Filters** to prevent duplicate views and interleave items according to defined business ratios.
