# Normalization

> **Category:** Databases

---

**Normalization** is a systematic database design technique used to organize tables and columns to reduce data redundancy and prevent data modification anomalies (Insertion, Update, and Deletion anomalies). Normalization decomposes monolithic, unorganized tables into smaller, well-structured relational tables linked by foreign keys.

### Normalization flow

```
  +--------------------+
  |  Un-normalized     | ---> Violates 1NF (Contains repeating groups / multi-value attributes)
  +--------------------+
            | Apply 1NF (Atomic Values)
            v
  +--------------------+
  | First Normal Form  | ---> Violates 2NF (Partial dependencies on composite keys)
  +--------------------+
            | Apply 2NF (Remove Partial Dependencies)
            v
  +--------------------+
  | Second Normal Form | ---> Violates 3NF (Transitive dependencies on non-key columns)
  +--------------------+
            | Apply 3NF (Remove Transitive Dependencies)
            v
  +--------------------+
  | Third Normal Form  | ---> Fully normalized production database schema
  +--------------------+
```

### Breakdown of Normal Forms

1. **First Normal Form (1NF)**:
   - Each column must contain atomic (indivisible) values.
   - Eliminates repeating groups or arrays stored in a single cell.
2. **Second Normal Form (2NF)**:
   - Must satisfy 1NF.
   - All non-key attributes must depend fully on the primary key (eliminates partial dependencies on composite keys).
3. **Third Normal Form (3NF)**:
   - Must satisfy 2NF.
   - Eliminates transitive dependencies (non-key columns depending on other non-key columns). Rule: *Attributes must depend on the key, the whole key, and nothing but the key.*
4. **Boyce-Codd Normal Form (BCNF)**:
   - Strict version of 3NF handling complex composite key edge cases.

### Normalization Evaluation Matrix

| Normal Form | Rule Requirement | Problem Resolved | Relational Impact |
| :--- | :--- | :--- | :--- |
| **1NF** | Atomic column values; unique row records | Multi-value list anomalies | Simple scalar column definitions |
| **2NF** | Full functional dependency on primary key | Partial dependency redundant writes | Splitting tables with composite keys |
| **3NF** | No non-key dependencies on other non-keys | Transitive update anomalies | Separating indirect attributes into distinct tables |

### Trade-offs of high normalization

While 3NF eliminates data redundancy and prevents data corruption during updates, highly normalized schemas require executing multi-table `JOIN` operations during reads, increasing query CPU and latency overhead for read-heavy workloads.

### Key takeaway

Normalization structures relational databases to eliminate data redundancy and modification anomalies. Target 3NF for transactional OLTP systems to preserve integrity.
