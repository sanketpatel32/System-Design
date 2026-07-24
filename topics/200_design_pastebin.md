# Design Pastebin
> **Category:** Beginner System Design Problems

---

### Overview
**Pastebin** is a text storage web service that allows users to upload raw text snippets (code logs, plain text) and share them via unique URLs. Unlike short URLs, pastebin payloads can be large (up to 10 MB per paste) and require persistent blob storage.

Core system constraints require **high read availability**, scalable object storage, automatic TTL expiration cleanup workers, and rate-limiting abuse protection.

### System Architecture & Storage Topology

```
+--------------------+     1. POST /api/v1/pastes (Raw Text)  +--------------------+
| Client Browser     | -------------------------------------> | API Gateway        |
+--------------------+                                        +--------------------+
         ^                                                              |
         | 5. Return HTTP 200 + Short Link                              v
         +--------------------------------------------------- +--------------------+
                                                              | Paste Service      |
                                                              +--------------------+
                                                                /                \
                                         2. Write Metadata     /                  \ 3. Upload Text Payload
                                                              v                    v
                                                   +--------------------+  +--------------------+
                                                   | Metadata DB        |  | Object Storage     |
                                                   | (MongoDB/PostgreSQL|  | (AWS S3 Bucket)    |
                                                   +--------------------+  +--------------------+
```

### Key Technical Mechanics
1. **Metadata vs Payload Separation:** Store metadata (paste ID, author, creation timestamp, expiration TTL, size) in a relational or document database, and store raw text content in AWS S3 object storage.
2. **KGS (Key Generation Service):** Pre-generates random 6-8 character Base62 keys asynchronously to prevent key generation DB locks during peak write bursts.
3. **Automated TTL Cleanup Worker:** Background cron task queries metadata for expired pastes, deletes S3 object blobs, and frees metadata keys.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/pastes` | POST | `{"title": "logs.txt", "content": "raw text...", "expire_after": "7d"}` | `{"paste_id": "k8X2p1", "paste_url": "https://pastebin.com/k8X2p1"}` |
| `/api/v1/pastes/{id}` | GET | None | `{"title": "logs.txt", "content": "raw text...", "views": 104}` |
| `/api/v1/pastes/{id}` | DELETE | Headers: `Authorization: Bearer <token>` | `{"status": "DELETED"}` |

### Data Model & Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `paste_id` | String (VARCHAR 8) | MongoDB / PostgreSQL | Primary Key / Unique ID of the paste. |
| `s3_object_key` | String | MongoDB / PostgreSQL | Path reference to raw text file in Object Storage (`pastes/2026/k8X2p1.txt`). |
| `user_id` | String (UUID) | Relational DB | Owner ID for registered users (Nullable for anonymous pastes). |
| `size_bytes` | Long | Relational DB | Size of paste payload for quota enforcement. |
| `expire_at` | Timestamp (Indexed)| Relational DB | Expiration date evaluated by background cleanup worker. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **S3 Object Storage vs Database Text Storage**| Cost-effective scaling for large multi-megabyte text payloads; offloads DB RAM. | Requires two network calls (DB lookup + S3 fetch) to serve a single paste. | Production pastebin systems handling large text snippets. |
| **Asynchronous Pre-Generated KGS Keys** | Guarantees instant key availability without runtime key collision checks. | Unused keys must be managed if background workers crash. | Systems handling heavy write bursts. |
| **Lazy Deletion vs Active Cron Cleanup** | Lazy deletion deletes S3 objects only when expired link is accessed; active cron cleans up storage systematically.| Lazy deletion leaves expired blobs consuming S3 storage indefinitely if never requested. | Combine both: active cron sweeps S3, lazy check blocks expired reads. |

### Key takeaway
**Pastebin** separates text payload storage (AWS S3 object storage) from indexing metadata (relational/NoSQL database). Use pre-generated Base62 keys for instant uploads and automated TTL background workers for storage cleanup.
