# Design Web Crawler

> **Category:** Search and Recommendation Systems

---

Design a distributed web crawler.

### Requirements
- **Functional**: crawl pages; extract links; store content; respect robots.txt.
- **Non-functional**: high throughput; politeness; freshness.

### Architecture
```
[URL frontier] -> [Crawler workers] -> [Content store]
                  [Link extractor] -> [URL frontier]
```

### URL frontier
- Priority queue of URLs to crawl.
- Priorities: freshness, importance, root domain.
- **Politeness**: per-domain rate limit.

### Crawling
- Fetch HTML.
- Parse, extract links.
- Store content for indexing.
- Add new URLs to frontier.

### Distributed
- Many workers across machines.
- URL dedup via hash set (Bloom filter for scale).
- Frontier shared via queue (Kafka).

### Politeness
- Respect robots.txt.
- Rate limit per domain (1 req/sec).
- Identify with User-Agent.
- Slow down on 429 / 5xx.

### Freshness
- Re-crawl periodically.
- More often for changing pages.

### Key takeaway
Web crawler = URL frontier (priority + politeness) + distributed workers + content store. Respect
robots.txt, rate-limit per domain. Bloom filter for URL dedup.
