# Design Twitter / X

> **Category:** Intermediate System Design Problems

---

Design Twitter: post tweets, follow, timeline, search, trends.

### Requirements
- **Functional**: post tweet (text/image/video); follow; timeline; search; trending.
- **Non-functional**: low-latency timeline; massive write/read scale.

### Estimation
- 250M DAU, 500M tweets/day, 10:1 read ratio.

### Architecture
```
[Client] -> [API] -> [Tweet service]
                     [Timeline service (fanout)]
                     [Graph service]
                     [Search service (Elasticsearch)]
                     [Trends service]
```

### Timeline generation (the core problem)
- **Fanout-on-write** for normal users: post → push to all followers' timeline caches.
- **Fanout-on-read** for celebrities (100M+ followers): pull their tweets when reading timeline.
- Hybrid: pre-built timeline + celebrity tweets pulled at read.

### Tweet storage
- **Postgres** for tweet metadata.
- **Cassandra** for massive scale (Twitter's actual choice).

### Search
- **Elasticsearch** inverted index.
- Search within user's follows (filtered) or globally.

### Trending topics
- Sample stream of tweets.
- Count hashtag occurrences over time windows.
- Top N per region.

### Key takeaway
Twitter's hard problem is **timeline fanout at celebrity scale**. Hybrid model: fanout-on-write
for normal users, fanout-on-read for celebrities. Cassandra for write throughput, Redis for
pre-built timelines.
