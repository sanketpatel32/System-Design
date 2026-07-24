# Metadata Storage

> **Category:** Storage Systems

---

Metadata storage is a dedicated database system designed to store and query **file descriptors, ownership details, access control lists (ACLs), directory mappings, and chunk pointers**, completely decoupled from raw binary payloads. Decoupling metadata from file data enables sub-millisecond path lookups, rich search queries, and high concurrency.

### Decoupled Storage Architecture

Decoupling separates lightweight, highly queryable metadata from heavy, immutable file binary payloads.

```
                                  +-----------------------+
                                  |   Client Application  |
                                  +-----------------------+
                                     /                             1. Query / Update Metadata                 2. Download Payload directly
                                   /                                                       v                       v
      +---------------------------------------+       +---------------------------------------+
      |        Metadata Storage Service       |       |        Object Storage (S3 / Blob)     |
      | - High-IOPS Key-Value / Relational DB |       | - High-Bandwidth Binary Payload       |
      | - Indexes: Filename, User, Size, Tags |       | - Raw Chunk Extents                   |
      +---------------------------------------+       +---------------------------------------+
```

### Why Decouple Metadata from Binary Data?

- **Payload Size Variance**: Binary files range from megabytes to gigabytes, whereas metadata records are tiny (typically < 1KB).
- **Access Patterns**: Metadata requires high IOPS, low-latency relational or key-value queries, while file payloads require high sequential bandwidth.
- **Search & Indexing**: Users frequently search by file extension, owner, timestamp, or tag without needing to read binary contents.

### Data Model & Table Schema

```sql
CREATE TABLE file_metadata (
    file_id         UUID PRIMARY KEY,
    user_id         UUID NOT NULL,
    parent_folder_id UUID NULL,
    file_name       VARCHAR(255) NOT NULL,
    size_bytes      BIGINT NOT NULL,
    mime_type       VARCHAR(128) NOT NULL,
    storage_uri     VARCHAR(1024) NOT NULL,
    checksum_sha256 CHAR(64) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_parent ON file_metadata(user_id, parent_folder_id);
```

### Metadata Storage Database Options Matrix

| Database Technology | Query Capability | Scalability | Latency | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Relational (PostgreSQL/MySQL)**| Complex SQL, Transactions | Vertical + Sharded | Low (Sub-10ms) | File systems requiring transactional directory renames |
| **Distributed KV (DynamoDB/Cassandra)**| Key-Value lookups, Secondary Indexes | Infinite Horizontal | Ultra-Low (< 5ms) | Dropbox/Drive scale metadata at billions of records |
| **In-Memory Cache (Redis)**| High-speed lookups | RAM-constrained | Sub-millisecond | Caching hot metadata records and session state |

### Consistency & Cache Synchronization Strategies

1. **Read-Through / Cache-Aside**: Hot file metadata records are cached in Redis to offload persistent databases.
2. **CDC (Change Data Capture)**: Database WAL logs push metadata updates via Debezium to Elasticsearch for full-text file searching.
3. **Transactional Outbox Pattern**: Ensures metadata database updates and message notifications emit atomically.

### Key takeaway

Decoupling metadata storage from binary file storage is essential for high-scale storage engines. It isolates **high-IOPS transactional metadata queries from high-bandwidth binary downloads**.
