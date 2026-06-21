# Search Database

> **Category:** Databases

---

A search database (search engine) is optimized for **full-text search and relevance-ranked
queries**. Relational DBs do `LIKE '%word%'` — slow and inaccurate.

### Why a search DB
- **Full-text search** with tokenization, stemming, stopwords.
- **Relevance ranking** (TF-IDF, BM25).
- **Faceted navigation** (filter by category, brand, price).
- **Fuzzy matching** (typos, synonyms).
- **Highlighting** of matched terms.
- **Autocomplete** / suggestions.

### How it works
1. **Inverted index**: maps each word → list of documents containing it.
   ```
   "laptop" -> [doc1, doc5, doc12, ...]
   ```
2. **Tokenizer**: splits text into words, normalizes (lowercase, stem).
3. **Scorer**: ranks results by relevance.

### Popular options
| | Notes |
|--|-------|
| **Elasticsearch** | Industry standard, Lucene-based |
| **OpenSearch** | ES fork, Apache-licensed |
| **Apache Solr** | Lucene-based, enterprise |
| **Meilisearch** | Lightweight, fast, easy |
| **Typesense** | Similar to Meilisearch |
| **Algolia** | Hosted, premium |
| Postgres FTS | Built-in (tsvector), less powerful |

### Architecture pattern
```
[Postgres] --CDC (Debezium)--> [Elasticsearch] --< search API
(source of truth)              (search index)
```
The relational DB remains source of truth; ES is a derived read model updated via CDC.

### Use cases
- E-commerce product search.
- Document/content search.
- Log search (ELK stack).
- Autocomplete / typeahead.
- Geospatial queries (ES geo support).

### Trade-offs
- ✅ Excellent search.
- ✅ Fast at scale.
- ❌ Eventually consistent (derived index).
- ❌ Memory-hungry (indices live in RAM).
- ❌ Operational complexity (clusters, shards, replicas).

### Key takeaway
When users need real search (relevance ranking, faceting, fuzziness), use a search DB
(Elasticsearch / OpenSearch). Index from your source-of-truth DB via CDC. Don't try to do real
search in SQL.
