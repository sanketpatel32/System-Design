# Design Facebook News Feed

> **Category:** Intermediate System Design Problems

---

Design FB's News Feed: ranked feed of friends' posts.

### Requirements
- **Functional**: ranked feed; like/comment/share; multiple content types.
- **Non-functional**: low-latency feed; personalized ranking.

### Feed generation
- **Fanout-on-write** to friends' feed caches.
- For each user, pre-build ranked feed.

### Ranking (EdgeRank → ML)
Signals:
- **Affinity**: how often you interact with the author.
- **Weight**: type of post (photos weigh more).
- **Decay**: newer posts favored.
- Modern: deep learning on engagement predictions.

### Architecture
```
[Client] -> [Feed service]
              |
              +-> [Pre-built feed cache (Redis)]
              +-> [Ranking service (ML)]
              +-> [Post service]
              +-> [Graph service (follows)]
```

### Data stores
- **Postgres / Cassandra** for posts.
- **Redis** for pre-built feeds.
- **S3 + CDN** for media.
- **Graph DB** for social graph (or sharded Postgres).

### Read flow
1. Fetch pre-built feed from Redis.
2. Page 1-50, then fetch more on scroll.

### Personalization
- ML model predicts engagement per post per user.
- Re-rank candidates.
- A/B test continuously.

### Key takeaway
FB News Feed = fanout-on-write + ML ranking. Pre-build per-user feeds in Redis, rank by
predicted engagement. Hybrid push/pull for celebrity scale.
