# Design Typeahead / Autocomplete
> **Category:** Search and Recommendation Systems

---

### Overview
A **Typeahead / Autocomplete** system predicts and suggests the top $K$ (typically 5) search queries as a user types characters into a search box. It serves suggestions under **< 30ms latency** to enhance search UX and reduce user typing effort across Google, Amazon, or YouTube.

System architecture requires **Prefix Trie Data Structures**, Redis Trie Caching, and asynchronous offline Trie builders powered by Apache Spark or MapReduce.

### System Architecture & Prefix Trie Topology

```
+------------------+     1. GET /api/v1/suggest?q=sys       +--------------------+
| Client Browser   | -------------------------------------> | API Gateway /      |
| (Search Bar)     | <------------------------------------- | Edge Load Balancer |
+------------------+     4. Return Top 5 ("system design")  +--------------------+
                                                                      |
                                                                      | 2. Fetch Cached Suggestions
                                                                      v
                                                            +--------------------+
                                                            | Redis Trie Cache   |
                                                            | (Hot Prefixes)     |
                                                            +--------------------+
                                                                      |
                                                                      | 3. Cache Miss -> Query Trie
                                                                      v
                                                            +--------------------+
                                                            | In-Memory Trie     |
                                                            | Query Servers      |
                                                            +--------------------+
                                                                      ^
                                                                      | Periodic Sync
                                                            +--------------------+
                                                            | Offline Trie       |
                                                            | Builder (Spark)    |
                                                            +--------------------+
```

### Key Technical Mechanics
1. **Prefix Trie Data Structure:** A tree structure where each node represents a character. To eliminate $O(N)$ traversal overhead during runtime queries, each Trie node directly pre-stores the **Top 5 most popular completion phrases** for that prefix.
2. **Asynchronous Offline Trie Building:** Raw search logs are aggregated continuously into Kafka. An offline Apache Spark job runs hourly to compute query frequency weights, construct an updated Trie, and deploy snapshot files to memory servers.
3. **Browser Client Debouncing:** Mobile/Web clients delay sending autocomplete HTTP requests until the user pauses typing for 50ms - 100ms, reducing backend traffic by up to 70%.

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/suggest` | GET | `q=sys`, `limit=5` | `{"prefix": "sys", "suggestions": ["system design", "system design interview", "system architecture", "syslog", "systemd"]}` |
| `/api/v1/analytics/query`| POST | `{"query": "system design", "timestamp": 1700000000}`| Ingests raw query log for offline Trie frequency weight computation. |

### Data Model & Prefix Cache Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `prefix_key` | String (e.g., `sys`) | Redis Cache | Cache lookup key for instant retrieval. |
| `top_suggestions` | JSON Array | Redis Cache | Pre-computed array of top 5 completion strings: `["system design", ...]`. |
| `query_phrase` | String (Primary Key)| Cassandra / HBase | Raw search query string. |
| `frequency_count` | BigInt | Distributed Storage | Aggregated search frequency count used by Spark Trie Builder. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Pre-Stored Top 5 at Trie Nodes** | Reduces query latency from $O(N)$ down to $O(L)$ where $L$ is length of prefix (< 30ms). | Increases in-memory RAM consumption of Trie node structures. | Essential requirement for high-throughput autocomplete systems. |
| **Offline Spark Trie Building** | Eliminates CPU contention on runtime query servers; guarantees stable Trie performance. | Newly trending queries take up to 1 hour to appear in autocomplete suggestions. | Standard search engine and e-commerce autocomplete systems. |
| **Client-Side Debouncing (100ms)**| Prevents network flood on every keystroke; dramatically cuts backend API server load. | User typing very slowly experiences slight delay before suggestions appear. | Mobile and web search interfaces. |

### Key takeaway
A **Typeahead / Autocomplete System** delivers sub-30ms search suggestions by pre-storing the **Top 5 completion phrases at each Prefix Trie node**, serving hot prefixes from **Redis memory caches**, and updating frequency weights using **offline Apache Spark jobs**.
