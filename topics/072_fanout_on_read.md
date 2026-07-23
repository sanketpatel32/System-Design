# Fanout on Read

> **Category:** Scaling

---

Fanout-on-read (pull model) = **when a user opens their feed, fetch and merge recent posts
from all their followees on the fly.** Writes are O(1).

### How it works
```
1. Bob opens app.
2. System fetches Bob's followees (say 500 users).
3. Fetch each followee's recent posts (from cache/DB).
4. Merge, rank, paginate.
5. Return feed.
```

### Pros
- ✅ **Cheap writes** — just store the post once.
- ✅ **No celebrity problem** — Bieber's tweets pulled, not pushed.
- ✅ **Fresh** — no pre-computed stale inbox.
- ✅ **Lower storage** — posts stored once.

### Cons
- ❌ **Slow reads** — must fan out to N followees.
- ❌ **Doesn't scale for users following many accounts** (or many celebrities).
- ❌ **Cache misses hurt** — must fetch from DB.
- ❌ **Ranking is expensive** at read time.

### Optimization
- **Cache followees' recent posts** in Redis (last 100 each).
- **Parallelize fanout** (N concurrent fetches).
- **Limit fanout depth** (only fetch from last 200 followees who posted).
- **Pre-compute** for users with few followees (hybrid).

### When to use
- **Celebrity accounts** — their posts get pulled into millions of feeds.
- **Read-light users** — not worth pre-computing for.
- **Real-time / chronological** — no ranking needed.

### Hybrid (the answer)
Most real systems combine:
- Normal users → **fanout-on-write**.
- Celebrities → **fanout-on-read**.
- Reader's feed = pre-built inbox + celebrity tweets pulled at read time.

### Key takeaway
Fanout-on-read is the **escape hatch** for celebrity-scale. Reads are slower (must fan out to
followees) but writes are cheap. Combine with fanout-on-write for the hybrid that scales
everywhere.
