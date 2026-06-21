# Design Trending Topics

> **Category:** Search and Recommendation Systems

---

Design trending topics: identify what's gaining traction now.

### Requirements
- **Functional**: top N trending topics per region/globally; updated frequently.
- **Non-functional**: real-time; accurate.

### Approach
- Sample stream of events (tweets, searches).
- Count occurrences in sliding window.
- Rank by **growth rate** (not absolute count).

### Architecture
```
[Event stream] -> [Sampler] -> [Counter (Redis)] -> [Ranker]
```

### Sliding window counting
- Count hashtags / topics in last 1 hour, 24 hours.
- Compare to baseline (yesterday same hour).
- Topics with high growth = trending.

### Sampling
- Sample 1-10% of full stream.
- Sufficient for trend detection.

### Real-time
- Stream processing (Flink, Spark Streaming).
- Update rankings every minute.

### Regional trending
- Partition counts by region.

### Key takeaway
Trending = sample event stream + sliding window counts + rank by growth (not absolute).
Stream processing for real-time updates. Partition by region for local trends.
