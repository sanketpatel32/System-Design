# Foreign Key

> **Category:** Databases

---

A **Foreign Key** (FK) is a column or group of columns in one table that references the primary key of another table. Foreign keys establish and enforce referential integrity between tables, ensuring that relationships between records remain valid and consistent.

### Structural relationship

```
     +-------------------------+                 +-------------------------+
     |         USERS           |                 |         ORDERS          |
     +-------------------------+                 +-------------------------+
     | PK  id          (101)   | <---+           | PK  id          (9001)  |
     |     email               |     |           | FK  user_id     (101) --+
     |     name                |     |           |     order_date          |
     +-------------------------+     |           +-------------------------+
                                     +------------------ Referential Match
```

### Referential integrity actions

When a primary key record is modified or deleted, foreign key constraints determine how child records react:

1. **`ON DELETE CASCADE`**: Deleting the parent record automatically deletes all referencing child records.
2. **`ON DELETE SET NULL`**: Deleting the parent record sets the foreign key column in child records to `NULL`.
3. **`ON DELETE RESTRICT / NO ACTION`**: Prevents deletion of the parent record if referencing child records exist (Default safety behavior).
4. **`ON DELETE SET DEFAULT`**: Sets the foreign key column to its defined default value.

### Foreign Key Trade-Off Matrix

| Dimension | Database-Enforced Foreign Keys | Application-Level Enforcement |
| :--- | :--- | :--- |
| **Data Integrity** | Absolute (Guaranteed by DB engine locks) | Vulnerable to application bugs, race conditions, or scripts |
| **Write Performance** | Slower (Requires index checks on referenced table per write) | Fast (Zero database check overhead) |
| **Sharding & Scaling** | Extremely difficult across distributed shards | Seamless (App handles cross-shard relationships) |
| **Operational Overhead**| High locking during bulk deletes with `CASCADE` | App-driven granular background deletion jobs |

### Distributed microservices consideration

In distributed systems and microservices architectures, foreign key constraints across microservice database boundaries are prohibited. Each service owns its database instance, and referential integrity is maintained asynchronously via event-driven messaging or application validation logic.

### Key takeaway

Foreign keys maintain data integrity in single-instance relational databases. In distributed microservice architectures, foreign key constraints are replaced by application-level validation and event-driven updates.
