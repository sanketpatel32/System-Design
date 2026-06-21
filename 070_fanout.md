# Fanout

> **Category:** Scaling

---

Fanout = **one input event triggers many downstream actions**. The classic example: a
Twitter post triggers notifications to millions of followers.

### Push vs Pull fanout (Twitter's dilemma)
| | Fanout-on-write (push) | Fanout-on-read (pull) |
|--|------------------------|------------------------|
| On post | Write to every follower's inbox | Do nothing |
| On read | Read pre-built inbox | Query all followees, merge |
| Best for | Read-heavy, small followings | Users with huge followings |
| Worst for | Celebrities (millions of writes per post) | Slow feed generation |

### Hybrid (real Twitter)
- **Normal users**: fanout-on-write (push to followers' inboxes).
- **Celebrities**: fanout-on-read (their tweets pulled at read time).
- Threshold by follower count (e.g. > 100k followers → celebrity mode).

### Other fanout patterns
- **Pub/sub**: one message → all subscribers (Kafka, SNS, Redis pub/sub).
- **Webhooks**: one event → many registered URLs.
- **Search indexing**: one DB write → many index updates.
- **Cache invalidation**: one update → many cache evictions.
- **Notifications**: one event → email + push + SMS + in-app.

### Challenges
- **Volume** — a single event can spawn millions of operations.
- **Latency** — async processing avoids blocking the original write.
- **Failure** — one slow consumer shouldn't stall the others.
- **Ordering** — fanout consumers may race; ensure idempotency.

### Architecture
```
[Post] -> [Kafka topic] -> [Fanout worker]
                              |
                              +--> push to inbox (async)
                              +--> notify (async)
                              +--> index for search (async)
                              +--> analytics (async)
```

### Key takeaway
Fanout is fundamental for social/notification systems. Use **async (queue-based)** fanout to
decouple producers from millions of consumers. For celebrity skew, hybrid push/pull avoids the
write-amplification disaster.
