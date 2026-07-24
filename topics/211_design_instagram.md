# Design Instagram
> **Category:** Intermediate System Design Problems

---

### Overview
**Instagram** is a massive photo and video sharing social network designed to support over 1 billion active users. The platform handles high-volume media uploads, asynchronous image processing, photo filtering, and personalized news feeds served under **< 100ms latency**.

Key technical challenges involve **Hybrid Fanout Feed Generation** (handling celebrity "celebrity fanout explosion" without overloading Redis queues), scalable media CDN delivery, and distributed photo storage.

### System Architecture & Hybrid Fanout Topology

```
+--------------------------------------------------------------------------+
| INSTAGRAM CLIENT APP (Mobile iOS / Android)                              |
+--------------------------------------------------------------------------+
       |                                                 |
       | 1. POST /api/v1/posts (Media Upload)            | 2. GET /api/v1/feed
       v                                                 v
+------------------+                            +------------------+
| Media Upload     |                            | Feed Service     |
| Service          |                            +------------------+
+------------------+                                     |
       |                                                 v Read Feed
       | 3. Async Image Processing & S3 Upload     +------------------+
       v                                           | Redis Feed Cache |
+------------------+                               | & User Timelines |
| Kafka Event      |                               +------------------+
| Stream           |                                     ^
+------------------+                                     |
       |                                                 | Push Fanout (Normal Users)
       v 4. Fanout Engine Evaluates Follower Count       |
+--------------------------------------------------------------------------+
| FANOUT ENGINE:                                                           |
| - Normal Users (<10k followers): PUSH to Redis timelines asynchronously  |
| - Celebrity Users (>10k followers): PULL on-demand at feed query time    |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics & Hybrid Fanout
1. **Fanout-on-Write (Push Model):** When a user with a modest follower count posts, a background worker pushes the post ID into every follower's Redis timeline list. Fast read performance ($O(1)$ lookup), but slow write fanout if followers total millions.
2. **Fanout-on-Read (Pull Model):** Posts from high-profile "celebrity" accounts (e.g., > 100,000 followers) are NOT pushed to follower timelines. Instead, when a user opens their feed, the system pulls the celebrity's recent posts and merges them with the cached user timeline in memory.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/posts` | POST | `{"caption": "Sunset photo", "image_s3_url": "s3://raw/p1.jpg", "location": "LA"}` | `{"post_id": "p_8821", "status": "PROCESSING"}` |
| `/api/v1/feed` | GET | `{"user_id": "u_99", "limit": 20, "max_id": "p_8800"}` | `{"posts": [{"post_id": "p_990", "url": "https://cdn.inst.com/p990.webp", "likes": 420}], "next_cursor": "p_8780"}` |
| `/api/v1/posts/{id}/like`| POST | None | `{"status": "SUCCESS", "likes_count": 421}` |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `post_id` | BigInt (Snowflake) | Cassandra / CockroachDB | Primary Key; includes 41-bit timestamp for natural chronological sorting. |
| `user_id` | String (UUID) | Relational DB | Post creator identifier. |
| `media_urls` | JSONB | Relational DB | Map of optimized S3/CDN WebP variant URLs (`thumb`, `full`). |
| `user_timeline:{id}`| Redis List (ZSET) | Redis Cache | In-memory timeline array containing recent post IDs for user feed. |
| `likes_counter` | Counter | Redis / Cassandra | Distributed atomic counter tracking post likes. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Hybrid Fanout (Push + Pull)** | Prevents system collapse during celebrity posts while preserving sub-100ms feed reads for normal users. | Increases feed generation query logic complexity (must merge cached push feed with pull feeds). | High-scale social networks with celebrity accounts. |
| **Cassandra NoSQL Storage** | High-throughput write performance for post metadata; horizontal partition scaling. | Lacks ACID transactional joins; requires application-level data denormalization. | Distributed social media post and timeline index storage. |
| **CDN Image Optimization (WebP)** | Reduces mobile payload download size by 40%, speeding up feed scroll rendering. | CPU processing overhead on initial image upload worker nodes. | Mobile-first image and video social feeds. |

### Key takeaway
**Instagram** achieves fast feed rendering using a **Hybrid Fanout Architecture** (Push for normal accounts, Pull for celebrities) paired with **Redis timeline caching** and **Snowflake ID sorting**.
