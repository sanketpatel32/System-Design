# Design Instagram

> **Category:** Intermediate System Design Problems

---

Design a photo/video sharing app: post, follow, feed, like, comment.

### Requirements
- **Functional**: post photos/videos; follow users; feed; like; comment; stories.
- **Non-functional**: low-latency feed; highly available; massive scale.

### Estimation
- 500M DAU, 100M posts/day, 10:1 read ratio.

### Architecture
```
[Client] -> [API] -> [Post service]
                     [Feed service (fanout)]
                     [Graph service (follows)]
                     [Notification service]
                              |
                              v
                  [Postgres] [Redis (feed)] [S3 (media)] [Kafka]
```

### Data model
```
users (id, username, ...)
posts (id, user_id, media_url, caption, created_at)
follows (follower_id, followee_id)
likes (post_id, user_id)
comments (post_id, user_id, text, created_at)
```

### Media storage
- S3 for originals + thumbnails.
- CDN for global delivery.

### Feed generation
- **Fanout-on-write**: when user posts, push to followers' feeds (Redis lists).
- **Hybrid**: celebrities use fanout-on-read.

### Newsfeed ranking
- Chronological or ranked (engagement, recency, affinity).

### Key takeaway
Instagram = posts in Postgres + media in S3 + CDN + Redis pre-built feeds (fanout-on-write).
For celebrities, switch to fanout-on-read. Engagement-based ranking for personalization.
