# Design Product Search

> **Category:** Search and Recommendation Systems

---

Design product search for e-commerce (Amazon).

### Requirements
- **Functional**: search by keyword; filter (price, brand); sort; faceted nav.
- **Non-functional**: <100ms response; high availability.

### Architecture
```
[Client] -> [Search API] -> [Elasticsearch]
                            [Product DB (Postgres)]
                            [Personalization]
```

### Elasticsearch
- Index products: name, description, category, attributes.
- Full-text + filters.

### Faceted navigation
- "Narrow by category, brand, price range".
- ES aggregations compute counts.

### Ranking
- Relevance (text match).
- Popularity (sales).
- Personalization (user's history).

### Synonyms + typo tolerance
- "iphone" matches "iPhone".
- "laptap" → "laptop".

### Catalog pipeline
- DB → ETL → ES index.
- Update on product changes (CDC).

### Key takeaway
Product search = Elasticsearch (full-text + facets) + ranking (relevance + popularity) +
personalization. Index from catalog DB via CDC. Synonyms + typo tolerance for UX.
