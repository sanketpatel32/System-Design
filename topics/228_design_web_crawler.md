# Design Web Crawler
> **Category:** Search and Recommendation Systems

---

### Overview
A **Web Crawler** (e.g., Googlebot) is an automated system that systematically browses the World Wide Web to discover, fetch, and download web pages for search engine indexing.

Core system constraints require **scalability** (handling billions of URLs), **politeness** (respecting `robots.txt` and avoiding server overloading), **duplicate detection** (Bloom Filters), and robust link extraction loops.

### Web Crawler Architecture & URL Frontier Topology

```
+--------------------------------------------------------------------------+
| URL FRONTIER QUEUE                                                       |
|  [ Priority Queue (PageRank Weight) ] --> [ Politeness Host Queues ]    |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Dequeue Polite Target URL
+--------------------------------------------------------------------------+
| ASYNCHRONOUS HTML DOWNLOADER & DNS RESOLVER (Async Netty / libcurl)       |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Fetch Raw HTML Page
+--------------------------------------------------------------------------+
| CONTENT PARSER & DUPLICATE DETECTOR (SimHash / SHA-256 Content Hash)     |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Extract Links
+--------------------------------------------------------------------------+
| LINK EXTRACTOR & BLOOM FILTER DUPLICATE URL CHECKER                      |
| (Verifies if extracted URL has already been seen)                        |
+--------------------------------------------------------------------------+
                                     |
                                     v 4. Enqueue New Unseen URLs
+--------------------------------------------------------------------------+
| STORAGE ENGINE (Raw Web Pages to S3 / URL Frontier for Re-crawling)      |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **URL Frontier Architecture:**
   - **Priority Queue:** Categorizes URLs based on PageRank or domain authority to fetch important pages first.
   - **Politeness Queue:** Groups URLs by target host domain (`example.com`). Ensures a worker thread waits a configured delay (e.g., 1000ms) between consecutive requests to the same domain, strictly obeying `robots.txt`.
2. **Bloom Filter URL Deduplication:** Uses in-memory probabilistic Bloom Filters to check if a newly discovered URL has been seen before in $O(1)$ time without database lookups.
3. **DNS Caching Resolver:** Pre-caches DNS hostname-to-IP resolutions locally to eliminate DNS network lookup bottlenecks during high-throughput crawling.

### Crawler Specification & Rules API

| Config / Component | Setting / Rule | Description |
|---|---|---|
| `robots.txt Evaluator` | Mandatory Protocol | Parses domain `robots.txt` rules before fetching; respects `Disallow:` directives. |
| `Crawl Delay` | Configurable (e.g., 1s) | Minimum politeness interval between requests to identical target IP address. |
| `User-Agent String` | Custom Identifier | `Googlebot/2.1 (+http://www.google.com/bot.html)` identifying crawler identity. |

### URL Frontier Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `url_hash` | String (SHA-256) | Bloom Filter / RocksDB | Fingerprint checking if URL has been enqueued. |
| `url_string` | Text | RocksDB / Cassandra | Full target URL string (`https://example.com/page.html`). |
| `host_domain` | String (Indexed) | URL Frontier Queue | Domain string used for politeness queue routing. |
| `priority_score` | Float | Priority Queue | Priority metric derived from domain authority. |
| `last_crawled_at` | Timestamp | Relational / NoSQL | Timestamp for tracking re-crawl scheduling interval. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **In-Memory Bloom Filter Deduplication** | Extremely low memory footprint; sub-microsecond $O(1)$ duplicate check. | Probability of false positives (may skip a valid un-crawled URL). | Large-scale web crawlers evaluating billions of URLs. |
| **Host-Based Politeness Queues** | Prevents accidental Denial of Service (DoS) attacks on third-party websites. | Reduces crawl throughput speed for single small web domains. | Mandatory requirement for all polite web crawlers. |
| **Distributed RocksDB URL Frontier** | High-throughput local SSD storage; handles billions of queued URLs without RAM limits. | Requires state synchronization across distributed crawler worker nodes. | Scalable web crawler nodes. |

### Key takeaway
A **Web Crawler** manages URL discovery and page downloads by balancing **Priority and Host Politeness Queues** in the URL Frontier, enforcing `robots.txt` rules, and using **Bloom Filters for $O(1)$ URL deduplication**.
