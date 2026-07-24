# Design Twitter / X
> **Category:** Intermediate System Design Problems

---

### Overview
**Twitter (X)** is a real-time microblogging and social networking platform handling over 500 million tweets published per day. System requirements emphasize **ultra-low read latency (< 50ms)** for feed generation, high write throughput for tweet ingestion, real-time hashtag search, and trending topics calculation.

The architecture centers around Twitter's iconic **Fanout Engine (Timeline Service)**, **Snowflake ID generation**, and **Redis memory-optimized timeline data structures**.

### System Architecture & Timeline Fanout Topology

```
+------------------+     1. POST /v1/tweets ("Hello World")     +--------------------+
| Mobile Client /  | -----------------------------------------> | Write API Gateway  |
| Web Client       |                                            +--------------------+
+------------------+                                                      |
                                                                          | 2. Persist Tweet
                                                                          v
+------------------+                                            +--------------------+
| Read API Gateway |                                            | Tweet DB & Search  |
+------------------+                                            | (Manhattan/ES)     |
         |                                                      +--------------------+
         | 5. Read Timeline (Sub-50ms)                                    |
         v                                                                v 3. Dispatch Event
+------------------+                                            +--------------------+
| Timeline Service | <----------------------------------------- | Fanout Engine      |
+------------------+        4. Push Tweet ID to Follower        | (Kafka + Workers)  |
         |                     Redis Timelines                  +--------------------+
         v
+--------------------+
| Redis Memory Cluster|
| (Home Timelines)   |
+--------------------+
```

### Key Technical Mechanics
1. **Twitter Snowflake IDs:** 64-bit time-sortable unique IDs generated without coordination across distributed nodes:
   - `1 bit` reserved | `41 bits` timestamp (ms) | `10 bits` worker node ID | `12 bits` sequence number.
2. **Redis In-Memory Home Timelines:** Stores recent 800 tweet IDs for every active user in a Redis sorted set (`ZSET`), indexed by Snowflake Tweet ID timestamp.
3. **Celebrity Read-Path Merging:** Users following accounts with millions of followers (e.g., Elon Musk) pull recent celebrity tweets at query time and merge them into the cached home timeline.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/tweets` | POST | `{"text": "Hello Twitter!", "media_ids": ["m_99"]}` | `{"tweet_id": "170000849201948201", "created_at": "..."}` |
| `/api/v1/timelines/home`| GET | `{"count": 20, "since_id": "1700008490000"}` | `{"tweets": [{"id": "170000849201948201", "text": "Hello Twitter!"}], "has_more": true}` |
| `/api/v1/tweets/{id}/retweet`| POST | None | `{"status": "RETWEETED", "retweet_count": 1402}` |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `tweet_id` | Int64 (Snowflake) | Manhattan / Distributed DB | Primary Key; time-ordered 64-bit ID. |
| `user_id` | Int64 | Distributed DB | ID of tweet author. |
| `text` | String (VARCHAR 280)| Distributed DB | Tweet text content. |
| `home_timeline:{user_id}`| Redis ZSET | Redis In-Memory | Sorted set of recent tweet IDs score-sorted by Tweet ID. |
| `user_followers:{user_id}`| Redis / Cassandra | Graph / Distributed DB | List of follower user IDs used by Fanout Engine. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Fanout-on-Write (Push to Redis)** | Ultra-fast sub-50ms feed reads; simple query logic for front-end API gateways. | Huge memory footprint in Redis; write amplification when accounts with high follower counts tweet. | Social networks prioritizing sub-50ms feed read performance. |
| **Snowflake 64-Bit Time Sortable IDs**| Completely eliminates database locks during ID generation; naturally orders tweets chronologically. | Requires dedicated Snowflake daemon servers across cluster nodes. | High-throughput distributed message generation engines. |
| **Active User Timeline Eviction** | Keeps only active users' timelines in Redis RAM (evicts users inactive > 30 days). | Inactive users experience slight delay on first login while timeline is rebuilt from DB. | Memory optimization for massive userbases. |

### Key takeaway
**Twitter (X)** delivers real-time feed performance by using **64-bit Snowflake IDs** for time-ordered sorting and a **Fanout-on-Write Engine** pushing tweet IDs to active users' **Redis timeline caches**.
