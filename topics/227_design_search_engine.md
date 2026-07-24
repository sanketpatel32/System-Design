# Design Search Engine
> **Category:** Search and Recommendation Systems

---

### Overview
A **Search Engine** (e.g., Google, Bing) crawls the web, indexes billions of web pages into inverted indexes, ranks results using PageRank and relevance ML algorithms, and answers search queries in milliseconds.

### Architecture Topology Diagram

```
+--------------------------------------------------------------------------+
|                             INDEPENDENT CRAWLER                          |
| [ Web Crawler ] ---> [ Page Downloader ] ---> [ Document Storage (S3) ]   |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Extracted Text Tokens
+--------------------------------------------------------------------------+
|                             INDEXING PIPELINE                            |
| [ MapReduce / Spark ] ---> Build Inverted Index ---> [ Sharded Index DB ]|
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Query Inverted Index
+--------------------------------------------------------------------------+
|                             QUERY & RANKING                              |
| Query: "system design" -> [ PageRank + BM25 Scoring ] -> [ Ranked Results]|
+--------------------------------------------------------------------------+
```

### Core Subsystems Breakdown

| Subsystem | Responsibilities |
|---|---|
| **Web Crawler** | Discovers and fetches web page documents recursively across the internet. |
| **Inverted Indexer**| Parses web page text into tokenized term postings lists mapped to document IDs. |
| **Query Engine** | Evaluates multi-term boolean queries across distributed inverted index shards. |
| **Ranker Engine** | Sorts documents using PageRank link analysis, BM25 text relevance, and BERT ML relevance. |

### Inverted Index Data Structure Example
```
Term         Posting List (Doc ID, Term Frequency, Positions)
-------------------------------------------------------------
"system"  -> [Doc 1 (tf: 3, pos: [4, 12, 90])], [Doc 88 (tf: 1, pos: [2])]
"design"  -> [Doc 1 (tf: 2, pos: [5, 13])], [Doc 42 (tf: 4, pos: [1, 9, 22, 50])]
```

### Key takeaway
A Search Engine relies on **Web Crawlers** to populate raw storage and offline **MapReduce/Spark batch pipelines** to build distributed **Inverted Indexes**, using **PageRank** and **BM25** to rank results.
