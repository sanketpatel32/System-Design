# Denormalization

> **Category:** Databases

---

**Denormalization** is the strategy of intentionally introducing redundancy into a normalized database schema by adding duplicate columns, pre-aggregated fields, or combined tables. Denormalization trades write complexity and storage overhead for faster read performance by eliminating expensive SQL `JOIN` operations.

### Structural transformation

```
 Normalized Schema (3NF - Requires JOINs)
 +---------------+       +-----------------+       +-----------------+
 |     USERS     | <---> |     ORDERS      | <---> |    PRODUCTS     |
 +---------------+       +-----------------+       +-----------------+
 (Requires multi-table JOINs during high-frequency read operations)

                                    |
                                    v Denormalize for Read Speed
 
 Denormalized Read Model (Flat Document / Table)
 +-------------------------------------------------------------------+
 | ORDERS_READ_MODEL                                                 |
 +-------------------------------------------------------------------+
 | order_id | user_name | user_email | product_title | price | qty   |
 +-------------------------------------------------------------------+
 (Zero JOINs required; single-pass index scan read)
```

### Common denormalization techniques

1. **Storing Derived / Aggregated Fields**: Caching pre-calculated metrics directly on parent records (e.g., storing `item_count` and `total_amount` on an `orders` table instead of running `SUM()` queries over `order_items`).
2. **Duplicating Frequently Joined Columns**: Adding `user_name` directly to the `orders` table to render order summaries without joining the `users` table.
3. **Pre-Joined Read Models (Materialized Views)**: Maintaining separate flat read-optimized tables updated synchronously or asynchronously via triggers or background jobs.

### Denormalization Trade-Off Matrix

| Metric | Normalized Database (3NF) | Denormalized Database |
| :--- | :--- | :--- |
| **Read Performance** | Slower (Requires multi-table `JOIN`s and aggregation) | Extremely Fast (Single table scan, zero `JOIN`s) |
| **Write Performance** | Fast (Single source of truth updated once) | Slower (Multiple redundant tables/columns must be updated) |
| **Data Consistency Risk**| Zero Risk (Single source of truth) | High Risk (Stale data if redundant fields fall out of sync) |
| **Storage Footprint** | Compact | Increased (Duplicate data across tables) |

### Managing data drift in denormalized tables

- **Database Triggers**: Execute atomic updates to denormalized tables whenever primary source tables change.
- **Asynchronous CDC (Change Data Capture)**: Use tools like Debezium and Kafka to capture primary table mutations and update downstream denormalized read views asynchronously.

### Key takeaway

Denormalization optimizes read performance by eliminating expensive `JOIN` operations and pre-computing aggregations. Use denormalization selectively for read-heavy access patterns, and establish automated sync mechanisms to prevent data inconsistencies.
