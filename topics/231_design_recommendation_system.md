# Design Recommendation System
> **Category:** Search and Recommendation Systems

---

### Overview
A **Recommendation System** predicts and ranks items (products, videos, movies, articles) that a user is likely to engage with, using collaborative filtering, content-based filtering, and deep learning models.

### Machine Learning Recommendation Pipeline

```
+------------------+     1. User / Context Request     +--------------------+
| Application API  | --------------------------------> | Retrieval / Candidate|
+------------------+                                   | Generation Service |
                                                       +--------------------+
                                                                 |
                                                                 v 2. Fetch ~1,000 Candidates
                                                       +--------------------+
                                                       | Multi-Stage        |
                                                       | Filtering Service  |
                                                       +--------------------+
                                                                 |
                                                                 v 3. ~200 Filtered Items
                                                       +--------------------+
                                                       | Scoring & Ranking  | (Deep Learning DLRM /
                                                       | ML Engine          |  Two-Tower Model)
                                                       +--------------------+
                                                                 |
                                                                 v 4. Top 20 Recommendations
                                                       +--------------------+
                                                       | Re-ranking Engine  | (Diversity & Business Rules)
                                                       +--------------------+
```

### Recommendation Modeling Approaches

| Technique | Mathematical Mechanism | Pros | Cons |
|---|---|---|---|
| **Collaborative Filtering**| Matrix Factorization / Singular Value Decomposition (SVD) | Learns complex preferences without item domain metadata | Cold start problem for new users/items |
| **Content-Based Filtering**| Compute cosine similarity on item feature vectors | No user cold start problem; easily explainable | Over-specialization (lacks serendipity) |
| **Two-Tower Neural Network**| User Tower + Item Tower embedding dot product | Real-time candidate retrieval across millions of items | Requires continuous ML pipeline retraining |

### Feature Store & Vector DB Integration
- **Feature Store (Feast / Tecton)**: Serves low-latency real-time user features (e.g., last 5 items viewed) and offline batch historical stats.
- **Vector Database (Milvus / Pinecone)**: Performs $k$-Nearest Neighbor ($k$-NN) approximate search on 512-dimensional embeddings.

### Key takeaway
Modern Recommendation Systems execute a **two-stage pipeline**: fast **candidate retrieval** (vector ANN search yielding ~1,000 candidates) followed by fine-grained **deep learning ML scoring** to select the top 20 items.
