# Design Search Engine

> **Category:** Search and Recommendation Systems

---

Design a web search engine like Google.

### Requirements
- **Functional**: index the web; search; rank by relevance.
- **Non-functional**: massive scale; sub-second responses.

### Architecture
```
[Crawler] -> [Indexer] -> [Inverted Index] -> [Searcher]
                                                 |
                                                 v
                                            [Ranker (ML)]
```

### Crawling
- Seed URLs; BFS through links.
- Politeness (rate limit per domain).
- Distributed crawler farm.
- Detect changes (re-crawl frequency).

### Indexing
- **Inverted index**: word → list of pages.
- PageRank + relevance signals.
- Sharded across thousands of nodes.

### Ranking
- TF-IDF / BM25 base.
- ML on top: links, freshness, user behavior, location.

### Query
- Parse, tokenize.
- Look up inverted index.
- Rank, personalize, return.

### Key takeaway
Search engine = **crawler + inverted index + ranker (ML)**. Crawling at web scale is hard
(politeness, freshness). Indexing is the core: word → page lists. Ranking combines TF-IDF +
ML signals.
