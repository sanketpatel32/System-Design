# Fanout on Write

> **Category:** Scaling

---

**Fanout on Write** (also known as the **Push Model**) is an architecture where creating a new piece of content (e.g., a tweet or status update) triggers immediate asynchronous delivery and duplication of that content into the personal feed mailboxes of all followers or recipients at write time.

### Architecture flow

```
  +--------------+         +------------------+         +------------------+
  | Author Posts | ------> |  Fanout Worker   | ------> | Follower Graph   |
  | Status Update|         |  Processing Pool |         | (Fetch 5k users) |
  +--------------+         +------------------+         +------------------+
                                    |
                    Parallel Bulk Insert ($O(N)$ Writes)
                                    v
       +--------------------+--------------------+--------------------+
       |                    |                    |                    |
       v                    v                    v                    v
+--------------+     +--------------+     +--------------+     +--------------+
| Follower 1   |     | Follower 2   |     | Follower 3   |     | Follower N   |
| Timeline DB  |     | Timeline DB  |     | Timeline DB  |     | Timeline DB  |
+--------------+     +--------------+     +--------------+     +--------------+
```

### Core mechanics

1. **Content Submission**: Author submits post `Post_123`.
2. **Graph Lookup**: Fanout service queries the social graph service to retrieve the list of all follower IDs for the author.
3. **Batch Insertion**: Async background queue workers push `Post_123` into the Redis timeline structures (e.g., `ZADD`) for every identified follower.
4. **Fast Reading**: When followers open their feeds, the app executes a simple `ZREVRANGE` on their personal timeline key, yielding pre-computed results with minimal latency.

### Operational trade-offs

| Characteristic | Evaluation | Impact |
| :--- | :--- | :--- |
| **Read Performance** | Extremely Fast ($O(1)$ complexity) | Timeline rendering requires zero joins or scatter-gather calls |
| **Write Latency** | High Amplification ($O(N)$ writes) | A post by a user with 10M followers triggers 10M database updates |
| **Storage Overhead** | Heavy Data Duplication | Post references are stored repeatedly across millions of timeline caches |
| **Consistency** | Eventual Consistency | Followers see posts as workers drain the fanout queue |

### Mitigation for the Celebrity Problem

For accounts with millions of followers, pure Fanout on Write creates massive write spikes, causing queue backlog and system lag. Systems typically bypass Fanout on Write for accounts exceeding a follower threshold (e.g., > 25,000 followers), falling back to Fanout on Read for those specific users.

### Key takeaway

Fanout on Write delivers fast read performance for newsfeeds and timelines by doing heavy work upfront. However, it suffers from write amplification and must be paired with Fanout on Read for high-follower celebrity accounts.
