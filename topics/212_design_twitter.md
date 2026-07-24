# Design Twitter / X
> **Category:** Intermediate System Design Problems

---

### Overview
**Twitter / X** is a real-time microblogging platform enabling users to broadcast short text messages (tweets), retweets, media, and follow social graphs with low feed latency.

### Capacity Estimation & Traffic Patterns
- **DAU**: 300 Million.
- **Tweet Volume**: 500M tweets per day (~5,800 tweets/sec average; peak ~25,000 tweets/sec).
- **Timeline Read Volume**: 30B timeline requests per day (~350,000 reads/sec).
- **Read/Write Ratio**: Extremely read-heavy (~60:1 Read:Write).

### Architecture Topology Diagram

```
+---------------+     1. POST /v1/tweets     +-------------------+
| Client App    | -------------------------> | API Gateway       |
+---------------+                            +-------------------+
        ^                                              |
        | 4. GET /v1/timeline                          v 2. Ingestion
        |                                    +-------------------+
        |                                    | Tweet Service     |
        |                                    +-------------------+
        |                                              |
        v                                              v 3. Fanout Event
+-------------------+     Feed Invalidation    +-------------------+
| Timeline Service  | <--------------------- | Fanout Service    |
+-------------------+                        | (KSQL / Redis)    |
        |                                    +-------------------+
        v Read Timeline Cache                          |
+-------------------+                                  v Save Metadata
| Redis Timeline    |                        +-------------------+
| In-Memory Cache   |                        | Manhattan DB /    |
+-------------------+                        | PostgreSQL Shards |
                                             +-------------------+
```

### Social Graph Data Model (Distributed Graph DB / MySQL Shards)

| Table | Partition Key | Key Fields |
|---|---|---|
| `tweets` | `tweet_id` (Snowflake ID) | `author_id`, `text`, `media_urls`, `created_at` |
| `follows` | `follower_id` | `followee_id`, `created_at` |
| `timelines` | `user_id` | `tweet_id` (Array of recent 800 tweet IDs in Redis) |

### Distributed Unique ID Generation (Snowflake ID)
64-bit integer guaranteeing global sorting by time without central database coordination:

$$\underbrace{1\text{ bit}}_{\text{Unused}} \, \vert \, \underbrace{41\text{ bits}}_{\text{Timestamp (ms)}} \, \vert \, \underbrace{10\text{ bits}}_{\text{Datacenter/Worker ID}} \, \vert \, \underbrace{12\text{ bits}}_{\text{Sequence Number}}$$

### Key Architectural Challenges & Solutions
1. **Celebrity Fanout Problem (Celebrity Spike)**: A tweet from an author with 100M followers requires 100M Redis cache writes. **Solution**: Skip fanout for users with $> 100\text{k}$ followers. Merge celebrity tweets into the user timeline at read time.
2. **Timeline Cache Size**: Store only `tweet_ids` (64-bit integers) in Redis arrays capped at the latest 800 items per active user. Hydrate tweet contents in batch (`MGET`) on frontend render.

### Key takeaway
Twitter uses **Snowflake 64-bit IDs** for time-ordered data partitioning and solves the celebrity fanout problem using a **Hybrid Push-Pull Feed Generation Model**.
