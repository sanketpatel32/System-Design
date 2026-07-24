# Design Instagram
> **Category:** Intermediate System Design Problems

---

### Overview
**Instagram** is a photo and video sharing social network enabling users to upload media, apply filters, follow users, and scroll through personalized timelines and stories.

### Capacity Estimation & System Scale
- **Daily Active Users (DAU)**: 500 Million.
- **Upload Scale**: 100M photos/videos per day (~1,150 uploads/sec).
- **Read Scale**: 5B feed views per day (~58,000 views/sec).
- **Media Storage**: $100\text{M} \times 500\text{ KB} = 50\text{ TB/day} \implies 18.25\text{ PB/year}$.

### System Architecture Diagram

```
+--------+     1. Direct S3 Upload (Presigned URL)     +-------------------+
| Client | -------------------------------------------> | Raw Media S3      |
+--------+                                              +-------------------+
    ^                                                             |
    |                                                             v 2. S3 ObjectCreated Event
    |                                                   +-------------------+
    |                                                   | Media Processing  |
    |                                                   | (Lambda/FFmpeg)   |
    |                                                   +-------------------+
    |                                                             |
    | 5. Feed Query (GET /v1/feed)                                | 3. Write Variants to CDN
    v                                                             v
+------------------+       4. Fanout Posts to Redis     +-------------------+
| Timeline Service | <--------------------------------- | Post Service      |
+------------------+                                    +-------------------+
        |                                                         |
        v Push / Pull Fanout Hybrid                               v Write Metadata
+------------------+                                    +-------------------+
| User Timeline    |                                    | Cassandra DB /    |
| Redis Clusters   |                                    | PostgreSQL Shards |
+------------------+                                    +-------------------+
```

### Core API Specification

| Endpoint | Method | Payload / Params | Response |
|---|---|---|---|
| `/api/v1/posts` | `POST` | `{"media_url": "s3://...", "caption": "Hello world"}` | `201 Created` -> `{"post_id": "p_9981"}` |
| `/api/v1/feed` | `GET` | `?limit=20&max_id=p_8810` | `200 OK` -> `[{"post_id": ..., "media_variants": [...]}]` |
| `/api/v1/users/{id}/follow`| `POST` | None | `200 OK` -> `{"status": "FOLLOWING"}` |

### Metadata Database Schema (Cassandra Partition Key Model)
```sql
-- User Timeline Table
CREATE TABLE user_timelines (
    user_id uuid,
    post_id timeuuid,
    author_id uuid,
    media_url text,
    caption text,
    PRIMARY KEY (user_id, post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);
```

### Feed Generation Strategy Matrix: Fanout-on-Write vs Fanout-on-Read

| Metric | Fanout-on-Write (Push Model) | Fanout-on-Read (Pull Model) | Hybrid Fanout (Instagram Strategy) |
|---|---|---|---|
| **Mechanism** | On post creation, push post ID to all follower Redis caches. | On feed fetch, fetch posts from followed authors on demand. | **Push** for standard users (<10k followers); **Pull** for celebrities (>10k followers). |
| **Write Latency** | High write amplification ($O(N)$ followers). | Instant post write ($O(1)$). | Balanced write performance ($O(\text{Followers}_{<10k})$). |
| **Read Latency** | Sub-second ($O(1)$ Redis cache read). | High read latency ($O(F)$ DB queries). | Low read latency; merges celebrity posts on read. |

### Key takeaway
Instagram leverages a **Hybrid Fanout Model**: push posts to follower feed caches in **Redis** for standard users, but pull celebrity posts dynamically on read to avoid write amplification bottlenecks.
