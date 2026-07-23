# Design Personalized Feed

> **Category:** Search and Recommendation Systems

---

Design a personalized feed (FB-style): mix of content tailored to user.

### Combine multiple signals:
- Posts from friends / followed.
- Recommended content.
- Sponsored content.
- Trending.

### Ranking
- Per-item, predict engagement (like, comment, share, time spent).
- Re-rank by predicted value.
- Diversity (don't show all from one source).

### Architecture
```
[User] -> [Feed service]
           |
           +-> [Candidate generation (multiple sources)]
           +-> [Ranking (ML model)]
           +-> [Diversity filter]
           +-> [Sponsored insertion]
           v
        [Feed]
```

### Two-stage
1. **Candidates**: get 1000s from various sources.
2. **Ranking**: ML model scores, takes top 50.

### Real-time updates
- New posts trickle into candidate pool.
- Re-rank on user action (click, dismiss).

### Key takeaway
Personalized feed = multi-source candidate generation + ML ranking + diversity filter.
Thousands of candidates → top N. Real-time updates on user actions.
