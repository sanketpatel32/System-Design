# Indexing

> **Category:** Databases

---

**Indexing** is a data structure technique used by database engines to rapidly locate rows without scanning every page in a table. An index creates an auxiliary search tree or hash table mapping indexed column values to their physical disk addresses, trading additional write latency and storage for significantly faster query execution.

### Internal B-Tree index structure

```
                         +-------------------+
                         |    Root Node      |
                         |     [ 20 | 50 ]   |
                         +-------------------+
                        /          |          \
           +-----------+    +------+------+    +-----------+
           | Internal  |    |  Internal   |    | Internal  |
           | [ 5 | 10 ]|    | [ 30 | 40 ] |    | [ 60 | 70]|
           +-----------+    +-------------+    +-----------+
             /       \         /        \        /       \
         +-----+   +-----+  +-----+   +-----+ +-----+   +-----+
         |Leaf |   |Leaf |  |Leaf |   |Leaf | |Leaf |   |Leaf |
         |[1,3]|   |[6,8]|  |[22] |   |[35] | |[52] |   |[75] |
         +-----+   +-----+  +-----+   +-----+ +-----+   +-----+
         (Points to physical data rows on disk / Clustered Key)
```

### Primary index data structures

1. **B-Tree / B+Tree**: Balanced search trees with O(log N) lookup, insert, and delete complexity. Ideal for range queries (`BETWEEN`, `>`, `<`), equality lookups, and sorted returns (`ORDER BY`). Used as the default index structure in PostgreSQL, MySQL (InnoDB), and Oracle.
2. **Hash Index**: O(1) point-lookup hash tables. Highly efficient for equality checks (`=`), but cannot support range queries or sorting.
3. **LSM-Tree (Log-Structured Merge)**: Append-only structure optimized for fast write operations, commonly used in NoSQL databases (Cassandra, RocksDB).
4. **GIN / GiST (Generalized Inverted Index)**: Used for composite, text search, JSON document, and spatial data indexing.

### Index classification comparison

| Index Type | Structure | Query Capabilities | Best Use Cases |
| :--- | :--- | :--- | :--- |
| **Clustered Index** | B+Tree (Sorts actual table rows on disk) | Range, Point, Order By | Primary Key (One per table) |
| **Secondary (Non-Clustered)** | B+Tree (Holds pointers to Clustered Key) | Point lookups, Filtering | Frequently searched non-PK columns (`email`, `status`) |
| **Covering Index** | B+Tree containing all queried columns | Eliminates double-lookups | High-frequency read queries |
| **Partial Index** | B+Tree filtering rows (`WHERE status = 'ACTIVE'`) | Compact storage & fast lookups | Large tables with status flags |

### The Write Penalty (Index Overhead)

While indexes accelerate read queries, every `INSERT`, `UPDATE`, or `DELETE` operation requires updating all associated indexes on the table, increasing write latency and storage utilization.

### Key takeaway

Indexes replace full table scans with O(log N) tree traversals. Focus indexes on high-cardinality columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses, avoiding over-indexing to protect write throughput.
