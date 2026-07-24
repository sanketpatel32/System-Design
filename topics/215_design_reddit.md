# Design Reddit
> **Category:** Intermediate System Design Problems

---

### Overview
**Reddit** is a network of community forums (subreddits) where users submit content (text, links, images), vote up or down, and participate in nested hierarchical comment threads sorted by real-time ranking algorithms ("Hot", "Top").

### Architecture Topology Diagram

```
+--------+     1. Submit Post / Vote     +-------------------+
| Client | ----------------------------> | API Gateway       |
+--------+                               +-------------------+
    ^                                              |
    | 5. Fetch Subreddit Feed                      v 2. Write Vote / Post
    |                                    +-------------------+
    | <--------------------------------- | Vote Service /    |
    |                                    | Subreddit Service |
    |                                    +-------------------+
    |                                              |
    v                                              v 3. Async Recalculate Rank
+-------------------+                    +-------------------+
| Feed Cache        | <----------------- | Real-time Hot     |
| (Redis Sorted Set)|                    | Score Worker      |
+-------------------+                    +-------------------+
                                                   | 4. Persist
                                                   v
                                         +-------------------+
                                         | Cassandra /       |
                                         | PostgreSQL Shards |
                                         +-------------------+
```

### Reddit "Hot" Ranking Algorithm

$$S = \log_{10}(z) + \frac{y \cdot t}{45000}$$

Where:
- $z = \max(|\text{ups} - \text{downs}|, 1)$
- $y = 1$ if $\text{ups} > \text{downs}$, $-1$ if $\text{ups} < \text{downs}$, $0$ if $\text{ups} = \text{downs}$.
- $t = \text{submission\_time} - \text{epoch\_start}$.

### Nested Comment Thread Data Representation

| Tree Storage Strategy | Schema Structure | Query Efficiency |
|---|---|---|
| **Materialized Path** | `path: "1/4/12/99"` | Fast subtree fetching (`WHERE path LIKE '1/4%'`); path string overhead |
| **Adjacency List** | `parent_id: "node_12"` | Recursive graph query; slow for deep trees |
| **Closure Table** | Separate `comment_ancestors` table | Extremely fast depth lookups; write amplification on insert |

### Subreddit Feed Caching via Redis Sorted Sets
- **Redis Key**: `subreddit:sysadmin:hot`
- **Data Structure**: **Sorted Set (ZSET)**.
- **Score**: Calculated "Hot" floating point rank $S$.
- **Value**: `post_id`.

### Key takeaway
Reddit relies on **Redis Sorted Sets (ZSETs)** to store real-time post ranks derived from time-decayed vote algorithms ($S$), and uses **Materialized Paths** for efficient nested comment thread queries.
