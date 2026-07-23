# Design Reddit

> **Category:** Intermediate System Design Problems

---

Design Reddit: subreddits, posts, comments (nested), votes.

### Requirements
- **Functional**: post to subreddit; comment (nested); vote; rank (hot).
- **Non-functional**: high read load; eventual consistency OK for votes.

### Data model
```
subreddits (id, name)
posts (id, subreddit_id, user_id, title, content, score, created_at)
comments (id, post_id, parent_comment_id, user_id, text, score)
votes (post_or_comment_id, user_id, direction)
```

### Nested comments
- **Adjacency list**: `parent_comment_id` (simple, recursive queries).
- **Materialized path**: `/1/3/7/` (fast subtree queries).
- **Nested sets**: fast reads, slow writes.

### Ranking (Hot algorithm)
```
score = log10(upvotes - downvotes) + seconds_since_epoch / 45000
```
- Boosts popular posts.
- Newer posts get a lift.

### Architecture
```
[Client] -> [API] -> [Post service]
                     [Comment service]
                     [Vote service]
                     [Search]
```

### Votes
- High write volume.
- Counted in Redis, periodically flushed to DB.

### Key takeaway
Reddit = subreddits + posts + nested comments + vote-based ranking. Use materialized path for
nested comments. Votes counted in Redis, batched to DB. Hot algorithm balances popularity +
recency.
