# Object Storage

> **Category:** Storage Systems

---

Object storage is a flat, non-hierarchical storage architecture that stores data as discrete **objects** consisting of data payloads, variable-length user metadata, and a globally unique identifier (Key). Object storage systems scale out to exabyte scales and are accessed exclusively via HTTP REST APIs.

### Flat Namespace Architecture

Object storage discards hierarchical directory structures. All objects reside in flat namespaces called **Buckets**, accessible directly via HTTP URLs (`https://storage.provider.com/bucket-name/object-key`).

```
+----------------------------------------------------------------------------------------------------+
|                                    Client App / Browser / Mobile                                  |
+----------------------------------------------------------------------------------------------------+
                                                  |
                           HTTP GET / PUT / DELETE / HEAD (REST API)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                      API Gateway / Load Balancers                                  |
+----------------------------------------------------------------------------------------------------+
                                                  |
         +----------------------------------------+----------------------------------------+
         |                                                                                 |
         v                                                                                 v
+----------------------------------------------------+   +----------------------------------------------------+
|  Metadata Key-Value Store (RocksDB / Cassandra)    |   |  Storage Nodes / Data Chunks (Erasure Coded)       |
|  - Key: "photos/2026/vacation.jpg"                 |   |  - Chunk 1: Disk Node A                            |
|  - Metadata: {Owner, ACL, Size, Content-Type}      |   |  - Chunk 2: Disk Node B                            |
|  - Pointer: [Node A/Chunk1, Node B/Chunk2]         |   |  - Chunk 3: Disk Node C                            |
+----------------------------------------------------+   +----------------------------------------------------+
```

### Core REST API Operations Matrix

| Method | Endpoint | Function | Key Headers |
| :--- | :--- | :--- | :--- |
| `PUT` | `/{bucket}/{key}` | Upload / overwrite an object payload | `Content-Type`, `x-amz-meta-*`, `Content-MD5` |
| `GET` | `/{bucket}/{key}` | Download object payload | `Range: bytes=0-1024`, `If-None-Match` |
| `HEAD` | `/{bucket}/{key}` | Fetch object metadata without data body | `x-amz-meta-*`, `ETag`, `Content-Length` |
| `DELETE` | `/{bucket}/{key}` | Delete specified object key | `x-amz-expected-bucket-owner` |

### Key Characteristics & Inner Mechanics

1. **Object Immutability**: Objects cannot be mutated in place; updating an object requires replacing the entire object payload.
2. **User-Defined Metadata**: Stores key-value pairs (e.g., `author`, `creation-date`, `tags`) directly alongside the object payload.
3. **Erasure Coding**: Splitting object data into $K$ data chunks and $M$ parity chunks (e.g., 8+4 scheme), allowing full data recovery even if 4 storage drives fail simultaneously.
4. **Infinite Horizontal Scale**: Storage nodes can be added continuously without re-architecting directory trees.

### Data Model & Object Layout Schema

| Data Attribute | Field Type | Description |
| :--- | :--- | :--- |
| `bucket_name` | `VARCHAR(63)` | Globally unique bucket identifier |
| `object_key` | `VARCHAR(1024)`| Unique string key (e.g., `logs/2026/07/app.log`) |
| `etag` | `VARCHAR(32)` | MD5 hash signature of the object payload |
| `size_bytes` | `UINT64` | Total size of object payload |
| `custom_metadata`| `MAP<STRING, STRING>` | User-defined headers (`x-amz-meta-department`) |
| `version_id` | `VARCHAR(64)` | Version identifier when bucket versioning is enabled |

### Trade-offs & Production Considerations

- ✅ **Infinite Scalability & Low Cost**: Accommodates exabytes of unstructured data at minimal cost per gigabyte.
- ✅ **Built-In Replication & High Durability**: Designed for 99.999999999% (11 9's) data durability via cross-rack erasure coding.
- ❌ **Higher First-Byte Latency**: HTTP REST latency (10-50 ms) is significantly higher than local disk block access (sub-ms).
- ❌ **No Partial Byte Updates**: Append or random write operations require re-uploading the entire object payload.

### Key takeaway

Object storage provides an **infinitely scalable, low-cost flat key-value store for unstructured media and backups**, exposing data via HTTP REST APIs with high durability guarantees.
