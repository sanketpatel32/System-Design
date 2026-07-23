# Design News Search

> **Category:** Search and Recommendation Systems

---

Design news search: search articles, freshness-weighted.

### Similar to general search with freshness emphasis.

### Key signals
- **Recency**: news is time-sensitive.
- **Source authority**: NYT > random blog.
- **Relevance**: query match.

### Ranking
```
score = relevance * source_authority * recency_boost
```

### Indexing
- Continuous: index new articles immediately.
- Time-based indices (drop old).

### Key takeaway
News search = general search + recency boost + source authority. Time-based indices for fast
old-data eviction. Continuous indexing for fresh content.
