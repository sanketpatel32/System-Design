# Design Search Engine
> **Category:** Search and Recommendation Systems

---

### Overview
A **Search Engine** (e.g., Google, Bing) crawls the World Wide Web, indexes billions of web documents, and returns relevant, authoritative search results ranked in milliseconds.

The system relies on five core subsystems: **Web Crawler**, **Document Ingestion Pipeline**, **Inverted Index Builder**, **PageRank Authority Evaluator**, and **Query Serving Engine**.

### Search Engine Architecture Topology

```
+--------------------------------------------------------------------------+
| WEB CRAWLER INFRASTRUCTURE (Fetches Web Pages via URL Frontier)          |
+--------------------------------------------------------------------------+
                                     |
                                     v Raw HTML Documents
+--------------------------------------------------------------------------+
| DOCUMENT PARSER & INVERTED INDEX BUILDER                                 |
|  [ Text Extractor ] --> [ Tokenizer / Stemmer ] --> [ MapReduce Indexer]|
+--------------------------------------------------------------------------+
                                     |
                                     v Inverted Index (Word -> Doc ID List)
+--------------------------------------------------------------------------+
| INVERTED INDEX CLUSTER & PAGERANK AUTHORITY STORE                        |
+--------------------------------------------------------------------------+
                                     ^
                                     | 2. Search Query ("system design")
+--------------------------------------------------------------------------+
| QUERY SERVING ENGINE & RANKER                                            |
| Calculates: Relevance Score (TF-IDF / BM25) * PageRank Authority Score   |
+--------------------------------------------------------------------------+
                                     ^
                                     | 1. GET /search?q=system+design
+--------------------------------------------------------------------------+
| USER BROWSER CLIENT                                                      |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Inverted Index Data Structure:** Maps terms/words to a postings list of document IDs containing the term:
   - `"system"` $\rightarrow$ `[Doc1 (tf: 5), Doc4 (tf: 2), Doc9 (tf: 12)]`
   - `"design"` $\rightarrow$ `[Doc1 (tf: 3), Doc9 (tf: 8)]`
   - Intersection of `"system"` AND `"design"` $\rightarrow$ `[Doc1, Doc9]`.
2. **BM25 Relevance Scoring:** Evaluates Term Frequency-Inverse Document Frequency (TF-IDF) to measure how relevant a web document is to a query string.
3. **PageRank Algorithm:** Computes document authority based on the quantity and quality of inbound links (backlinks) pointing to a web page.

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/search` | GET | `q=system+design`, `page=1`, `hl=en` | `{"total_results": 1420000, "search_time_ms": 18, "results": [{"doc_id": "d1", "title": "...", "snippet": "...", "url": "..."}]}` |

### Inverted Index & Postings Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `term` | String (Dictionary Key)| Memory / SSD Index | Tokenized search word (e.g., `architecture`). |
| `doc_id` | Int64 | Inverted Index Posting List | Identifier of document containing the term. |
| `term_frequency (tf)`| Integer | Inverted Index Posting | Occurrence count of term within the document. |
| `positions` | Array of Integers | Inverted Index Posting | Exact token offset positions for phrase matching queries (`"system design"`). |
| `pagerank_score` | Float | Metadata DB / Memory | Pre-calculated authority score derived from graph link analysis. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Inverted Indexing** | Sub-50ms search query evaluation across billions of web pages. | High memory and disk storage footprint; expensive map-reduce indexing compute. | Fundamental requirement for all text search engines. |
| **BM25 + PageRank Hybrid Scoring**| Delivers relevant search results while suppressing keyword-stuffed spam pages. | Computing PageRank over trillions of web graph edges requires massive distributed compute. | Global web search engines. |
| **Document Sharding vs Term Sharding**| Document Sharding partitions index by Doc ID; simplifies query routing and fault tolerance. | Query must be broadcast to all shard nodes in cluster (Scatter-Gather). | High-scale distributed search clusters. |

### Key takeaway
A **Search Engine** achieves fast, authoritative search results by parsing web pages into an **Inverted Index** (mapping terms to document posting lists) and ranking query matches using **BM25 relevance combined with PageRank link authority**.
