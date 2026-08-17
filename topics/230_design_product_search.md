# Design Product Search
> **Category:** Search and Recommendation Systems

---

### Overview
A **Product Search System** (e.g., Amazon Product Search, E-commerce Search) enables shoppers to search millions of catalog products using free-text queries, filter by complex facets (brand, price range, color, rating, inventory availability), and receive relevancy-ranked results in < 50ms.

Unlike web search, product search balances text relevancy (BM25) with **commercial conversion signals** (sales velocity, stock availability, margin, review rating) and real-time inventory updates.

### System Architecture & Faceted Search Topology

```
+--------------------------------------------------------------------------+
| SHOPPER CLIENT (Search Bar + Facet Filters: Brand=Sony, Price=$100-$300) |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. GET /api/v1/search?q=headphones&brand=Sony
+--------------------------------------------------------------------------+
| API GATEWAY & QUERY PARSER                                               |
|  [ Query Expander / Synonyms ] --> [ Intent Classifier (Electronics) ]   |
+--------------------------------------------------------------------------+
                                     |
                                     v 2. Parsed Query & Filters
+--------------------------------------------------------------------------+
| FACETED SEARCH ENGINE CLUSTER (OpenSearch / Elasticsearch)               |
|  [ Inverted Index Search ] + [ Aggregation Engine (Facet Bucket Counts)]  |
+--------------------------------------------------------------------------+
                                     |
                                     v 3. Join Live Stock & Price Status
+--------------------------------------------------------------------------+
| REAL-TIME INVENTORY CACHE (Redis Cluster: Stock Availability & Price)    |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Inverted Index with Faceted Aggregations:** Uses Elasticsearch/OpenSearch to construct bitset filters for attributes (`brand:Sony`, `category:Electronics`, `price:[100 TO 300]`). Returns matching product IDs along with dynamic facet counts (`Sony (42)`, `Bose (18)`).
2. **Query Expansion & Synonym Mapping:** Translates user query terms using e-commerce dictionaries (e.g., *"cheap phone"* arrow *"budget smartphone"*, *"sneakers"* arrow *"athletic shoes"*).
3. **Commercial Ranking Scoring Function:**

**Product Score** = S_text\ₘatch · w₁ + log(1 + Sales_Velocity) · w₂ + Rating · w₃ - Out_Of_Stock_Penalty

### API Interface Specifications

| Endpoint | Method | Request Parameters | Response Payload |
|---|---|---|---|
| `/api/v1/products/search`| GET | `q=wireless+headphones`, `brand=Sony`, `price_min=100`, `price_max=300`, `sort=bestselling` | `{"total": 42, "facets": {"brands": [{"name": "Sony", "count": 42}]}, "products": [{"sku": "s_104", "title": "Sony WH-1000XM5", "price": 298.00, "in_stock": true}]}` |

### Product Catalog Search Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `product_id` / `sku` | String | OpenSearch / DynamoDB | Primary Key for catalog product. |
| `title_text` | Text (Analyzed) | OpenSearch Inverted Index| Analyzed title field with stemming and synonym expansion. |
| `brand` | Keyword | OpenSearch Facet Index | Exact match keyword field for faceted filtering. |
| `price_cents` | Integer | OpenSearch Numeric Index| Indexed range field for price threshold filtering. |
| `in_stock` | Boolean | Redis Cache / OpenSearch | Real-time stock availability flag (Out of stock items penalized). |
| `sales_velocity_30d`| Integer | OpenSearch | 30-day sales count used for commercial popularity ranking. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Commercial Ranking over Pure Text Relevancy**| Increases e-commerce conversion rates and revenue by boosting bestsellers and in-stock items.| Can obscure niche, highly relevant products that have low historical sales velocity. | E-commerce product search engines. |
| **OpenSearch Bitset Facet Aggregations**| Returns accurate multi-attribute facet count buckets in sub-50ms query time. | High memory (RAM) consumption for storing fielddata/doc_values in search cluster nodes. | Retail e-commerce catalog filtering. |
| **Redis Real-Time Stock Hydration**| Prevents showing stale in-stock status when inventory sells out during flash sales. | Requires extra network hop to hydrate stock state post-OpenSearch query retrieval. | Flash-sale and high-throughput retail platforms. |

### Key takeaway
A **Product Search System** balances text relevancy with commercial ranking signals (sales velocity, ratings, margin), relying on **OpenSearch faceted bitset aggregations** for sub-50ms attribute filtering and **Redis** for real-time inventory verification.
