# Design Recommendation System

> **Category:** Search and Recommendation Systems

---

Design a recommendation system ("you might like...").

### Requirements
- **Functional**: recommend items (movies, products, songs) per user.
- **Non-functional**: fresh; personalized; scalable.

### Approaches

#### Collaborative filtering
- "Users like you also liked..."
- User-item matrix; similarity.
- Matrix factorization (SVD, ALS).

#### Content-based
- "Items similar to what you liked."
- Item features (genre, tags).
- Cosine similarity.

#### Hybrid
- Combine both.
- Deep learning (YouTube, Netflix).

### Architecture
```
[User history] -> [Feature pipeline] -> [Model training] -> [Model]
[Item catalog]                                              |
                                                            v
                                                       [Serving]
                                                            |
[User] -> [Rec service] -> [Model + candidate generation] -> recs
```

### Two-stage
1. **Candidate generation**: cheap model gets top 1000.
2. **Ranking**: expensive model ranks 1000 → top 10.

### Cold start
- New user: popular items, demographics.
- New item: content-based.

### Real-time
- Update recs on each interaction (click, like).

### Key takeaway
Recommendation = collaborative filtering + content-based + deep learning. Two-stage: candidate
generation + ranking. Handle cold start (new users/items) with popularity + content
signals.
