# Blob Storage

> **Category:** Storage Systems

---

Blob (Binary Large Object) storage is a cloud storage model engineered to store vast volumes of **unstructured binary data**, such as video streams, image assets, virtual hard disk files, and system logs. It isolates raw binary streams inside named containers, offering automated tiering and granular access delegation.

### Binary Large Object Architecture

The system segregates incoming payloads into chunked extent blocks, maintaining strict metadata mapping inside a distributed container index.

```
+----------------------------------------------------------------------------------------------------+
|                                Cloud Applications / Mobile Clients                                |
+----------------------------------------------------------------------------------------------------+
                                                  |
                            HTTPS API Access (Shared Access Signatures / OAuth)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                    Blob Storage Front-End Service                                  |
+----------------------------------------------------------------------------------------------------+
                                                  |
         +----------------------------------------+----------------------------------------+
         v                                                                                 v
+----------------------------------------------------+   +----------------------------------------------------+
|            Distributed Container Manager           |   |          Extent / Block Engine Storage             |
|  - Manages Blob Containers & Indexing              |   |  - Stores Raw Binary Block Payloads                |
|  - Evaluates Lifecycle & Tiering Policies          |   |  - Handles Extent Replication across Disks         |
+----------------------------------------------------+   +----------------------------------------------------+
```

### Blob Types Comparison Matrix

| Blob Type | Optimized Use Case | Append/Update Mechanism | Max Size Limit |
| :--- | :--- | :--- | :--- |
| **Block Blobs** | Streaming media, documents, images | Composed of discrete blocks; blocks can be uploaded in parallel | ~200 TB |
| **Append Blobs**| Logging streams, audit traces | Optimized for fast append operations at the end of the blob | ~195 GB |
| **Page Blobs** | VM Disk Images (.vhd), Database files | Optimized for random 512-byte read/write access patterns | ~8 TB |

### Data Model & Metadata Schema

| Attribute | Data Type | Purpose |
| :--- | :--- | :--- |
| `account_name` | `VARCHAR(64)` | High-level storage account partition namespace |
| `container_name`| `VARCHAR(63)` | Logical grouping container for permissions and lifecycle rules |
| `blob_name` | `VARCHAR(1024)`| Unique blob identifier string |
| `blob_type` | `ENUM` | `BlockBlob`, `AppendBlob`, `PageBlob` |
| `tier` | `ENUM` | `Hot`, `Cool`, `Cold`, `Archive` |
| `properties` | `JSON` | MD5 hash, Content-Type, Content-Encoding, Content-Length |

### Access Control & Lifecycle Tiering

1. **Shared Access Signatures (SAS)**: Cryptographically signed tokens that grant restricted, time-bounded read/write access to specific containers or blobs without exposing primary credentials.
2. **Automatic Lifecycle Tiering**: Rules automatically move blobs from Hot to Cool/Cold/Archive tiers based on last modified or access timestamps.
3. **Immutable Storage (WORM)**: Write Once, Read Many policies enforce legal holds and prevent blob deletion for compliance durations.

### Trade-offs & Production Considerations

- ✅ **Optimized Storage Types**: Specialized blob types (Block, Append, Page) optimize performance for specific access patterns.
- ✅ **Flexible Security Delegation**: Fine-grained SAS tokens allow direct client-to-storage file transfers.
- ❌ **Tier Transition Costs**: Moving blobs between cool and archive tiers incurs retrieval and read charges.
- ❌ **No Transactional Multi-Blob Updates**: Operations on individual blobs are atomic, but multi-blob transactions are not supported.

### Key takeaway

Blob storage optimizes **unstructured binary asset management** through specialized blob types (Block, Append, Page) and automated lifecycle cost tiering.
