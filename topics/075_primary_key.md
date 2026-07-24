# Primary Key

> **Category:** Databases

---

A **Primary Key** (PK) is a column or set of columns that uniquely identifies every row in a relational database table. Primary keys enforce entity integrity, prevent duplicate records, and automatically construct the primary clustered index in modern database engines (e.g., InnoDB in MySQL).

### System architecture

```
                     +-----------------------------------+
                     |         CLUSTERED B-TREE          |
                     +-----------------------------------+
                                    [ PK = 5 ]
                                   /          \
                                  /            \
                       [ PK = 2 ]               [ PK = 8 ]
                      /          \             /          \
               [Row: PK=1]   [Row: PK=2]   [Row: PK=7]   [Row: PK=8]
               (Data Record) (Data Record) (Data Record) (Data Record)
```

### Primary Key selection types

1. **Natural Key**: Uses pre-existing domain attributes with inherent uniqueness (e.g., Social Security Number, National ID). *Risk: Domain rules change, compromising key stability.*
2. **Surrogate Key**: An artificially generated unique identifier with no business logic meaning.
   - **Auto-Incrementing Integer (BIGINT)**: Fast, compact (8 bytes), highly efficient for B-Tree insertions due to sequential append. *Risk: ID enumeration security leaks; single-master bottleneck in distributed systems.*
   - **UUIDv4 (Random 128-bit)**: Globally unique across distributed nodes without coordination. *Risk: Random insertions cause B-Tree index fragmentation and page splits.*
   - **UUIDv7 / ULID (Time-Ordered 128-bit)**: Combines timestamp prefixes with random bits. Delivers global uniqueness while maintaining sequential B-Tree append efficiency.

### Primary Key implementation comparison

| Key Strategy | Storage Size | Distributed Unique | B-Tree Insert Efficiency | Security (Non-Enumeration) |
| :--- | :--- | :--- | :--- | :--- |
| **Auto-Increment BIGINT** | 8 Bytes | No (Requires central sequence) | Excellent (Sequential append) | Poor (Vulnerable to ID scraping) |
| **UUIDv4 (Random)** | 16 Bytes | Yes (No coordination) | Poor (Causes page splits & I/O) | Excellent (Cryptographically random) |
| **UUIDv7 / ULID** | 16 Bytes | Yes (No coordination) | Excellent (Time-ordered append) | High (Contains random entropy) |
| **Composite Key** | Variable | No | Good to Moderate | N/A |

### Best practices

- **Never use mutable columns** (e.g., user email) as primary keys; updates to primary keys require costly index updates and foreign key cascades.
- In distributed microservice environments, standardize on time-ordered unique keys such as **UUIDv7** or **Snowflake IDs**.

### Key takeaway

Primary keys uniquely identify rows and define clustered index layouts. Choose auto-incrementing integers for single-node systems, and time-ordered keys like UUIDv7 or Snowflake IDs for distributed architectures to avoid B-Tree page splits.
