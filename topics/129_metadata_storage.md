# Metadata Storage

> **Category:** Storage Systems

---

Metadata storage separates **file/object descriptors** (filename, path, owner, size, permissions, chunk mapping) from heavy binary file payloads to achieve high throughput and fast index querying.

### Architectural Separation Pattern

High-scale storage architectures isolate metadata reads/writes into low-latency relational or key-value databases, reserving object stores for payload data.

```
+-----------------------------------------------------------------------------------+
|                             Client Application Interface                          |
+-----------------------------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         | 1. Query / Update Metadata                              | 2. Fetch / Upload Payload
         v                                                         v
+------------------------------------+                    +-------------------------+
|     Metadata Storage Cluster       |                    |  Object / Blob Storage  |
|  (NewSQL / Distributed NoSQL)      |                    |    (Raw Data Chunks)    |
+------------------------------------+                    +-------------------------+
| Schema: file_id, owner_id, size,   |                    | Chunk 01: [0x8A2...]    |
| path, checksum, chunk_locations[]  |                    | Chunk 02: [0x4F1...]    |
+------------------------------------+                    +-------------------------+
```

### Database Selection Matrix for Metadata

| Engine Type | Examples | Read Latency | Scaling Strategy | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Distributed NoSQL** | Cassandra, DynamoDB | Sub-10 ms | Hash Sharding by File ID | Massively scalable key-value metadata |
| **NewSQL / Distributed SQL**| CockroachDB, TiDB | 10 - 20 ms | Range Sharding by Directory | POSIX file systems requiring ACID tree operations |
| **In-Memory Cache + RDBMS** | Redis + PostgreSQL | Sub-2 ms | Master-Replica + Caching | Fast lookup with strong relational integrity |

### Metadata Schema Example

| Column Name | Data Type | Description | Indexing Strategy |
| :--- | :--- | :--- | :--- |
| `file_id` | UUID / INT64 | Unique file identifier | Primary Key |
| `parent_directory_id` | UUID / INT64 | Parent folder path link | Secondary B-Tree Index |
| `file_name` | VARCHAR(255) | Name of the object | Composite Index `(parent_id, file_name)` |
| `size_bytes` | BIGINT | Payload size | Metrics / Quota audit |
| `storage_url` | VARCHAR(512) | Direct pointer to Object Store | Internal lookup |

### Consistency & Edge Cases

- **Two-Phase Commit vs Dual Writes**: Deleting a file requires updating the metadata DB and issuing a delete to the object store. Orphaned blobs are swept periodically using async garbage collectors.

### Key takeaway

Metadata storage decouples **lightweight directory attributes from heavy payloads**, enabling rapid metadata operations, custom indexing, and granular access control.
