# Design News Search
> **Category:** Search and Recommendation Systems

---

### Overview
**News Search** (e.g., Google News) indexes high-velocity, real-time news articles from publishers worldwide, grouping breaking coverage into clusters and ranking results by freshness and authority.

### Architecture Topology Diagram

```
+-------------------+     1. RSS / Webhook Ingestion     +-------------------+
| News Publishers   | ---------------------------------> | News Ingestion    |
+-------------------+                                    | Gateway           |
                                                         +-------------------+
                                                                   |
                                                                   v 2. Deduplicate & Extract
                                                         +-------------------+
                                                         | Kafka Event Stream|
                                                         +-------------------+
                                                                   |
                                                                   v 3. Extract Embeddings
                                                         +-------------------+
                                                         | Article Embedder  |
                                                         | (BERT Model)      |
                                                         +-------------------+
                                                                   |
                                          +------------------------+------------------------+
                                          |                                                 |
                                          v 4. Real-time Index                            v 5. Article Clustering
                                +-------------------+                             +-------------------+
                                | Elasticsearch /   |                             | News Clustering   |
                                | OpenSearch Index  |                             | (Locality Sensitive|
                                +-------------------+                             | Hashing - LSH)    |
                                                                                  +-------------------+
```

### Core Architectural Requirements

| Feature | Technical Solution |
|---|---|
| **Sub-second Freshness** | Near-real-time indexing via **Kafka** directly to **OpenSearch** memory buffers (refresh interval 1s). |
| **Article Deduplication** | **SimHash / MinHash** locality-sensitive hashing to detect syndicated news duplicate copy. |
| **Story Clustering** | Cluster articles covering the exact same event using vector cosine similarity on story embeddings. |

### News Ranking Scoring Function

$$\text{Score} = S_{\text{relevance}} \cdot S_{\text{authority}} \cdot e^{-\lambda \cdot \Delta t}$$

Where $e^{-\lambda \cdot \Delta t}$ represents steep exponential decay favoring newly published breaking articles over older coverage.

### Key takeaway
News Search prioritizes **real-time freshness** and **article clustering**. Use **Kafka + OpenSearch** for sub-second index visibility and **SimHash / LSH** algorithms to group duplicate breaking news stories.
