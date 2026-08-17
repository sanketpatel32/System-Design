# Search Database

> **Category:** Databases

---

A **Search Database** (or Search Engine) is a non-relational database specialized for full-text search, fuzzy matching, ranking, and complex multi-field filtering. Search engines operate using **Inverted Indexes**, mapping terms to matching document IDs for fast text lookups.

### Inverted Index architecture

```
Raw Documents:
Doc 1: "System Design Caching"
Doc 2: "Caching System Performance"

Inverted Index Structure:
+---------------+------------------------+
| Term / Word   | Posting List (Doc IDs) |
+---------------+------------------------+
| Caching       | [ Doc 1, Doc 2 ]       |
| Design        | [ Doc 1 ]              |
| Performance   | [ Doc 2 ]              |
| System        | [ Doc 1, Doc 2 ]       |
+---------------+------------------------+
```

### Core text search pipeline

1. **Document Ingestion & Analysis**: Text fields pass through analyzers that execute tokenization, lowercasing, stop-word removal (e.g., removing "and", "the"), and stemming (e.g., reducing "running" to "run").
2. **Inverted Index Construction**: Generates a sorted dictionary of terms mapped to posting lists containing document IDs, positions, and frequencies.
3. **Relevance Scoring (BM25 / TF-IDF)**: Ranks matching results based on Term Frequency (how often a term appears in a document) and Inverse Document Frequency (how rare the term is across the entire index).

### Search Engine vs Database Comparison

| Feature | Search Engine (Elasticsearch, OpenSearch) | Relational Database (SQL) |
| :--- | :--- | :--- |
| **Primary Search Index**| Inverted Index | B+Tree Index |
| **Query Matching** | Relevance scoring, fuzzy search, synonyms | Exact match (`=`) or wildcards (`LIKE '%term%'`) |
| **Write Consistency** | Eventual consistency (Refresh interval ≈ 1s) | Immediate consistency |
| **Best Used For** | Product catalog search, log monitoring, autocomplete | Transactional writes, ACID operations |

### Key takeaway

Search databases power full-text search and fuzzy query matching using inverted indexes and relevance scoring. Integrate search databases alongside primary datastores using Change Data Capture (CDC) to offload read-intensive search traffic.
