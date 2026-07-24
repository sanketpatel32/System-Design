# Design Product Search
> **Category:** Search and Recommendation Systems

---

### Overview
**Product Search** (e.g., Amazon, Flipkart) is an e-commerce search infrastructure designed for faceted filtering (category, price, brand), real-time inventory availability checks, and conversion-optimized ML relevance ranking.

### System Architecture Pipeline

```
+--------+     1. GET /search?q=laptop&brand=Dell     +-------------------+
| Client | -----------------------------------------> | API Gateway       |
+--------+                                            +-------------------+
    ^                                                           |
    | 5. Formatted Product Cards & Facets                       v 2. Query Search Cluster
    |                                                 +-------------------+
    | <---------------------------------------------- | Product Search    |
    |                                                 | Engine (Elastic)  |
    |                                                 +-------------------+
    |                                                           |
    |                                                           v 3. Hydrate Live Stock
    |                                                 +-------------------+
    |                                                 | Inventory DB      |
    |                                                 | (Redis / DynamoDB)|
    |                                                 +-------------------+
```

### Search Query Processing Steps
1. **Query Parsing & Entity Extraction**: Extract attributes (e.g., `"red running shoes size 10"` -> `category: shoes, color: red, size: 10`).
2. **Faceted Query Execution**: Search inverted index with boolean filters for attributes and category taxonomy.
3. **Inventory Hydration**: Join search hits with high-speed Redis cache to filter out out-of-stock items before rendering.

### Faceted Search Query Payload (Elasticsearch)
```json
{
  "query": {
    "bool": {
      "must": [{ "match": { "title": "laptop" } }],
      "filter": [
        { "term": { "brand.keyword": "Dell" } },
        { "range": { "price": { "gte": 500, "lte": 1500 } } }
      ]
    }
  },
  "aggs": {
    "brands": { "terms": { "field": "brand.keyword" } },
    "categories": { "terms": { "field": "category.keyword" } }
  }
}
```

### Key takeaway
Product Search requires **faceted aggregation** via **Elasticsearch / OpenSearch** coupled with high-speed **Redis inventory hydration** to filter out out-of-stock items dynamically.
