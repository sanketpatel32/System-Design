# Fanout on Write

> **Category:** Scaling

---

Fanout-on-write (push model) = **when a user posts, pre-compute and store the post in every
follower's feed**. Reads are then O(1).

### How it works
```
1. Alice posts tweet T.
2. System fetches Alice's followers (10,000 users).
3. For each follower, prepend T to their feed (Redis list, etc.).
4. When a follower opens the app, their feed is pre-built → instant.
```

### Pros
- ✅ **Fast reads** — feed is pre-built, just a list read.
- ✅ **Scales well for normal users** — most users have < 1k followers.
- ✅ **Cache-friendly** — feeds live in Redis, super fast.

### Cons
- ❌ **Write amplification** — one post = N writes.
- ❌ **Celebrity problem** — Justin Bieber with 100M followers = 100M writes per tweet.
- ❌ **Storage cost** — every feed stores every post (deduped or not).
- ❌ **Inactive followers** — wastes work pushing to users who never read.

### Real-world numbers
- Average user: 200 followers → 200 writes/post. Fine.
- Celebrity: 100M followers → 100M writes/post. **Not fine.**
- Solution: hybrid model — celebrities use fanout-on-read.

### Optimization
- **Async fanout** via Kafka — don't block the post.
- **Cap fanout** for users above some threshold.
- **Skip inactive followers** (haven't opened app in 30 days).
- **Cache pre-built feed** in Redis with TTL.

### Where else it's used
- **News feed ranking** (precompute ranked feed).
- **Notifications** (write to each recipient's notification list).
- **Activity streams** (GitHub, Instagram).

### Key takeaway
Fanout-on-write gives **O(1) reads** by paying at write time. Best for normal users with small
follower counts. For celebrities, switch to fanout-on-read. The hybrid model is the industry
standard.
