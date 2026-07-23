# Design LinkedIn Feed

> **Category:** Intermediate System Design Problems

---

Design LinkedIn's feed: professional updates, posts, articles, job recommendations.

### Similar to FB feed with professional signals:
- Connection updates (new job, work anniv).
- Industry content.
- Recruiter messages.

### Ranking signals
- Connection strength.
- Industry relevance.
- Engagement (likes, comments).
- Content type.

### Differences from FB
- Less viral, more relevant.
- Slower decay (professional content stays fresh).
- More passive consumption.

### Architecture
Same pattern: fanout-on-write + ranking service + cache.

### Key takeaway
LinkedIn feed = FB-style architecture with **professional ranking signals** (connection,
industry, career events). Less viral, more relevance-driven.
