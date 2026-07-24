# Relational Database Design

> **Category:** Databases

---

**Relational Database Design** is the process of structuring data into tables, defining attributes, establishing primary/foreign key relationships, and applying normalization principles to minimize redundancy and maintain data integrity.

### Architecture blueprint

```
  +------------------+         1:N Relationship        +------------------+
  |      USERS       | ------------------------------->|      ORDERS      |
  +------------------+                                 +------------------+
  | PK  id           |                                 | PK  id           |
  |     email        |                                 | FK  user_id      |
  |     created_at   |                                 |     total_amount |
  +------------------+                                 +------------------+
            |                                                   |
            |                 N:M (Junction Table)              |
            +---------------------> +-----------------+ <-------+
                                    |   ORDER_ITEMS   |
                                    +-----------------+
                                    | PK/FK  order_id |
                                    | PK/FK  item_id  |
                                    |        quantity |
                                    +-----------------+
```

### Essential design stages

1. **Conceptual Design**: Identify domain entities (e.g., User, Order, Product) and relationships using Entity-Relationship (ER) diagrams.
2. **Logical Design**: Translate entities into relational tables, specify data types, define constraints (`NOT NULL`, `UNIQUE`, `CHECK`), and assign primary keys.
3. **Normalization**: Apply normal forms (1NF, 2NF, 3NF) to eliminate insertion, update, and deletion anomalies.
4. **Physical Tuning**: Define index strategies (B-Tree, Hash), select storage engines, and introduce controlled denormalization for performance-critical queries.

### Relationship types & representation

| Relationship | Description | Relational Representation |
| :--- | :--- | :--- |
| **One-to-One (1:1)** | A user has one profile | Foreign key in either table with `UNIQUE` constraint |
| **One-to-Many (1:N)** | A user has multiple orders | Foreign key on the "Many" table (`orders.user_id`) |
| **Many-to-Many (N:M)** | Orders contain multiple products; products belong to multiple orders | Junction/Bridge table containing foreign keys referencing both primary tables |

### Data Integrity Constraints

- **Entity Integrity**: Every table must have a unique, non-null Primary Key.
- **Referential Integrity**: Foreign key values must match existing primary key values in the referenced table or be explicitly `NULL`.
- **Domain Integrity**: Attribute values must satisfy predefined types, checks, and constraints (e.g., `age INTEGER CHECK (age >= 0)`).

### Key takeaway

Sound relational database design relies on clear entity modeling, enforced referential integrity through foreign keys, and normalized tables to prevent data redundancy and update anomalies.
