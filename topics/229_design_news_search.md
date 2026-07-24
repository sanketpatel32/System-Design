# Design News Search
> **Category:** Search and Recommendation Systems

---

### Overview
**News Search** (e.g., Google News) indexes high-velocity, real-time news articles from publishers worldwide, grouping breaking coverage into story clusters and ranking results by freshness, relevance, and publisher authority.

Core technical demands focus on **sub-second indexing freshness**, deduplication of syndicated news copy (SimHash/MinHash), breaking news story clustering (Locality Sensitive Hashing), and steep time decay ranking functions.

### System Architecture Topology

```
+-------------------+     1. RSS / Webhook / Crawler Ingestion     +-------------------+
| News Publishers   | -------------------------------------------> | News Ingestion    |
+-------------------+                                              | Gateway           |
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
                                          +----------------------------------+----------------------------------+
                                          |                                                                     |
                                          v 4. Real-time Index (1s Refresh)                                    v 5. Article Clustering
                                +-------------------+                                                 +-------------------+
                                | OpenSearch Index  |                                                 | News Clustering   |
                                | (Near Real Time)  |                                                 | (LSH Engine)      |
                                +-------------------+                                                 +-------------------+
```

### Key Technical Mechanics
1. **Near-Real-Time Indexing (1s Memory Refresh):** News ingestion workers stream parsed articles directly to OpenSearch memory buffers with a 1-second refresh interval, making breaking news searchable worldwide within 1 second of publication.
2. **Syndicated Article Deduplication (SimHash):** Computes a 64-bit SimHash fingerprint for each article body. Articles with a Hamming distance $\le 3$ are identified as duplicate syndicated wire service copies (e.g., AP/Reuters reprints) and grouped under the original publisher.
3. **News Ranking Function with Steep Time Decay:**

$$\text{Score} = S_{\text{relevance}} \cdot S_{\text{authority}} \cdot e^{-\lambda \cdot \Delta t}$$

*Key Insight:* The exponential decay factor $e^{-\lambda \cdot \Delta t}$ uses a aggressive half-life (e.g., 4 hours), heavily penalizing older news articles to favor live breaking developments.

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/news/search`| GET | `q=earthquake`, `topic=WORLD`, `time=1h` | `{"total_clusters": 12, "articles": [{"title": "Major Earthquake Hits...", "cluster_id": "cl_99", "published_ago": "12m"}]}` |
| `/api/v1/news/clusters/{id}`| GET | None | Returns all aggregated publisher articles covering the exact same event. |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `article_id` | UUID | OpenSearch / Cassandra | Primary Key for news article record. |
| `publisher_id` | String | Relational DB | News outlet identifier (AP, Reuters, BBC). |
| `simhash` | Int64 (Bit Vector)| OpenSearch | 64-bit SimHash value used for Hamming distance deduplication. |
| `cluster_id` | String (Indexed) | OpenSearch | Identified story cluster grouping related breaking news coverage. |
| `published_at` | Timestamp | OpenSearch Index | Publication timestamp powering steep exponential time decay. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **SimHash Duplicate Detection** | Fast 64-bit Hamming distance checks; identifies near-duplicate syndicated news copy. | Can accidentally group distinct follow-up stories if article text overlaps significantly. | Real-time news aggregation and indexing platforms. |
| **Steep Exponential Decay ($\lambda = 4	ext{h}$)**| Ensures breaking news immediately tops search results over older established articles. | In-depth investigative journalism articles drop off search listings quickly unless boosted. | News search and breaking news aggregation engines. |
| **1-Second OpenSearch Memory Refresh**| Guarantees sub-second index visibility for breaking news alerts. | Increases disk I/O and CPU overhead on OpenSearch index nodes. | Real-time news search platforms. |

### Key takeaway
**News Search** prioritizes **sub-second index freshness** using Kafka and OpenSearch, deduplicating syndicated stories via **SimHash Hamming distances** and ranking breaking coverage using steep **exponential time decay scoring functions**.
