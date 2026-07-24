# Design Web Crawler
> **Category:** Search and Recommendation Systems

---

### Overview
A **Web Crawler** (e.g., Googlebot) systematically navigates the World Wide Web to discover, download, and index web pages while respecting robot exclusion rules (`robots.txt`) and domain politeness.

### High-Level Architecture Diagram

```
+------------------+     1. Seed URLs      +-------------------+
| Seed URL Generator| -------------------> | URL Frontier      |
+------------------+                       | (Priority Queue)  |
                                           +-------------------+
                                                     |
                                                     v 2. Next URL
                                           +-------------------+
                                           | DNS Resolver      |
                                           +-------------------+
                                                     |
                                                     v 3. Resolved IP
+------------------+     5. Raw Content    +-------------------+
| S3 Storage       | <-------------------- | HTML Downloader   |
+------------------+                       +-------------------+
                                                     |
                                                     v 4. Extract Links
                                           +-------------------+
                                           | Link Extractor &  |
                                           | Duplicate Filter  |
                                           +-------------------+
                                                     | (New Unique URLs)
                                                     v 6. Push Back
                                           +-------------------+
                                           | URL Frontier      |
                                           +-------------------+
```

### URL Frontier Architecture: Politeness & Priority
The URL Frontier prevents overloading target domains while prioritizing high-importance sites:

```
Priority Queues (F1, F2, F3) ---> Queue Selector ---> Politeness Queues (B1, B2... per domain) ---> Worker
```

| Politeness / Priority Feature | Mechanism |
|---|---|
| **Politeness Control** | Map each host domain to a dedicated queue; enforce a minimum delay (e.g., 1 sec) between requests to the same domain. |
| **URL Deduplication** | Maintain a Bloom Filter / Redis Set of all seen URLs to avoid duplicate crawling loops. |
| **`robots.txt` Parser**| Cache parsed `robots.txt` files per host domain in memory before scheduling downloads. |

### Key takeaway
Design Web Crawlers using a **URL Frontier** equipped with **Politeness Queues** (per-host delay enforcement) and **Bloom Filters** to perform high-throughput, non-disruptive web link discovery.
