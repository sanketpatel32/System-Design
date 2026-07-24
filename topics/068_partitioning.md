# Partitioning

> **Category:** Scaling

---

**Partitioning** is the process of dividing a database dataset into smaller, distinct sub-tables or partitions to improve query performance, manageability, and maintenance. Partitioning can occur within a single database instance (**Vertical/Horizontal Partitioning**) or across multiple machines (**Distributed Sharding**).

### Architectural view

```
                        [Original Monolithic Table]
                        +-------------------------+
                        | ID | Name | Age | Order |
                        +-------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
      (Horizontal Partitioning)                   (Vertical Partitioning)
    Split rows by condition                    Split columns by utility
  +-------------------------+                +---------------+  +--------------+
  | Partition 1 (Age < 30)  |                | ID | Name     |  | ID | Order   |
  +-------------------------+                +---------------+  +--------------+
  | Partition 2 (Age >= 30) |                | (Frequently)  |  | (Infrequent) |
  +-------------------------+                +---------------+  +--------------+
```

### Types of partitioning

1. **Horizontal Partitioning**: Splitting a table by rows. All partitions share the same column schema, but each row resides in a specific partition according to a partition rule (e.g., date range).
2. **Vertical Partitioning**: Splitting a table by columns. Frequently accessed, small columns are separated into a primary table, while large or infrequently accessed columns (e.g., `BLOB`, `TEXT`, `description`) move to secondary tables.

### Partitioning methods matrix

| Partition Method | Partition Rule Example | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Range Partitioning** | `created_at` BY MONTH | Easy date-based pruning; fast archiving | Skewed inserts hit the latest partition |
| **List Partitioning** | `region` IN ('US', 'EU') | Clean logical isolation by domain | Unmapped list values trigger write errors |
| **Hash Partitioning** | `hash(id) % 8` | Even data distribution across partitions | Range queries require scanning all partitions |
| **Composite Partitioning**| Range by Month + Hash by User | Handles large volume with balanced distribution | High operational schema maintenance |

### Partition pruning & performance

The primary performance benefit of horizontal partitioning is **Partition Pruning**: the query optimizer identifies partition boundaries from the `WHERE` clause and scans only relevant partitions, ignoring unneeded data segments entirely.

### Key takeaway

Partitioning optimizes query performance and storage management by breaking large tables into targeted segments. Use range partitioning for time-series data to leverage partition pruning, and vertical partitioning to separate frequently read columns from heavy binary blobs.
