# Amazon S3 Style Storage

> **Category:** Storage Systems

---

Amazon S3-style storage represents cloud-native **object storage implementing the industry-standard S3 API specification**. It uses a distributed key-value model to manage unstructured blob data across buckets, delivering strong consistency, multi-region replication, and automated lifecycle management.

### Distributed S3 System Architecture

The internal architecture decouples request routing, metadata indexing, and raw storage node chunk management.

```
+-----------------------------------------------------------------------------------------------------+
|                                          Client SDK / AWS CLI                                       |
+-----------------------------------------------------------------------------------------------------+
                                                   |
                             HTTPS REST API (S3 SigV4 Authenticated Requests)
                                                   v
+-----------------------------------------------------------------------------------------------------+
|                                    S3 Request Routing & Auth Layer                                  |
|                 - Validates IAM Policies & Signature V4 Signature                                   |
|                 - Routes Request based on Bucket Key Hash Prefix                                    |
+-----------------------------------------------------------------------------------------------------+
                                                   |
          +----------------------------------------+----------------------------------------+
          v                                                                                 v
+--------------------------------------------------+     +--------------------------------------------------+
|      Key-Value Metadata Directory Engine         |     |          Chunk Store (Data Storage Nodes)        |
|  - Partitioned via Consistent Hashing / LSM-Tree |     |  - 64MB Data Slabs                               |
|  - Tracks Object Versioning, ACLs, ETags         |     |  - Multi-AZ Erasure Coding (e.g., 8+4 Parity)   |
+--------------------------------------------------+     +--------------------------------------------------+
```

### Storage Classes & Lifecycle Management Matrix

| S3 Storage Class | Durability | Availability | Min Storage Duration | Typical Latency | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S3 Standard** | 11 9's (99.999999999%) | 99.99% | None | Milliseconds | Active web media, dynamic data |
| **S3 Standard-IA** | 11 9's | 99.9% | 30 days | Milliseconds | Monthly reports, backups |
| **S3 Glacier Instant** | 11 9's | 99.9% | 90 days | Milliseconds | Medical images, long-term media archives |
| **S3 Glacier Flexible**| 11 9's | 99.9% | 90 days | 3-5 Hours | Annual compliance archives |
| **S3 Deep Archive** | 11 9's | 99.9% | 180 days | 12 Hours | Regulatory backups, tape replacement |

### Core S3 API Capabilities

1. **Strong Consistency**: S3 provides strong read-after-write consistency for `PUT` and `DELETE` requests of objects in all AWS regions without performance degradation.
2. **Multipart Upload Protocol**: Large files (>100MB) are uploaded concurrently in chunks (5MB to 5GB per part) and assembled atomically upon completion.
3. **Presigned URLs**: Allows application backends to grant clients temporary cryptographic access to upload or download specific S3 objects directly.
4. **S3 Lifecycle Rules**: Automates transition of objects across storage classes (e.g., move Standard to Glacier after 30 days, expire after 365 days).

### Object Metadata Schema

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `Bucket` | `String` | Target bucket name |
| `Key` | `String` | Object key path |
| `StorageClass` | `Enum` | Storage class tier (`STANDARD`, `GLACIER`, etc.) |
| `ServerSideEncryption`| `String` | Encryption type (`AES256`, `aws:kms`) |
| `ChecksumSHA256` | `Base64` | Cryptographic checksum for data corruption verification |

### Key Trade-offs & Security Rules

- ✅ **De-Facto Industry Standard API**: Interoperable with MinIO, Ceph, GCP Cloud Storage, and Azure Blob.
- ✅ **Built-In Multi-AZ Durability**: Automatically protects against single data center outages.
- ❌ **Prefix Rate Limits**: Request limits apply per partition prefix (3,500 `PUT`/`POST`/`DELETE` and 5,500 `GET`/`HEAD` requests per second per prefix). Systems must use hashed key prefixes to scale beyond.

### Key takeaway

S3-style storage is the **de-facto standard for unstructured cloud data**, combining strong read-after-write consistency, fine-grained lifecycle transitions, and high durability through erasure coding.
