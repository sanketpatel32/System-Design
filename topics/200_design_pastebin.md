# Design Pastebin
> **Category:** Beginner System Design Problems

---

### Overview
**Pastebin** is a web service that allows users to upload plain text snippets (code, logs, notes) and receive a unique URL to view or share the content.

### System Requirements & Capacity Planning
- **Write Volume**: 1M pastes created per day (~12 writes/sec).
- **Read Volume**: 10M paste reads per day (~115 reads/sec).
- **Payload Size**: Max paste size = 1 MB; Average paste size = 10 KB.
- **Storage Requirement**: $1\text{M} \times 10\text{ KB} = 10\text{ GB/day} \implies 3.65\text{ TB/year}$.

### System Architecture Diagram

```
+--------+     1. POST /api/paste      +-------------------+      2. Save Text Block     +-------------------+
| Client | --------------------------> | Load Balancer /   | --------------------------> | Object Storage    |
+--------+                             | API Gateway       |                             | (S3 / MinIO)      |
    ^                                  +-------------------+                             +-------------------+
    |                                            |                                                 |
    |                                            v 3. Save Metadata                                |
    |                                  +-------------------+                                       |
    | <--- 4. 201 Created (Paste URL) -| Paste Service     | --------------------------------------+
    |                                  +-------------------+
    |                                            |
    |                                            v 4. Metadata Lookup
    |                                  +-------------------+
    | --- 5. GET /p/7xQ9a ------------> | PostgreSQL /      |
    |                                  | MongoDB Metadata  |
    +--------------------------------- +-------------------+
```

### Core API Interface

| Endpoint | Method | Request Payload | Response |
|---|---|---|---|
| `/api/v1/pastes` | `POST` | `{"content": "text...", "expire_after": "7d", "title": "log"}` | `201 Created` -> `{"paste_id": "7xQ9a", "url": "..."}` |
| `/api/v1/pastes/{paste_id}`| `GET` | None | `200 OK` -> `{"content": "text...", "created_at": ...}` |

### Data Model & Storage Strategy
Decouple metadata storage from text payload storage to maintain low database index bloat:
1. **Metadata Database (PostgreSQL / DynamoDB)**: Stores small, indexed attributes.
2. **Object Storage (AWS S3)**: Stores raw text payload files.

```json
// Metadata Record Schema (PostgreSQL)
{
  "paste_id": "7xQ9a",
  "title": "System Log Output",
  "s3_key": "pastes/2026/07/7xQ9a.txt",
  "size_bytes": 10240,
  "user_id": "usr_881",
  "expire_at": "2026-08-01T00:00:00Z"
}
```

### Key Technical Challenges & Solutions
- **Expiration / Purging**: Use database TTL or periodic batch cleanup workers to delete expired S3 objects and metadata.
- **Abuse Prevention**: Scan incoming text payloads for malware/phishing signatures; enforce IP rate limits.

### Key takeaway
Design Pastebin by **decoupling text content from metadata**. Store raw text in object storage (**S3**) and metadata in a relational or Key-Value store, using a **Key Generation Service (KGS)** for unique paste IDs.
