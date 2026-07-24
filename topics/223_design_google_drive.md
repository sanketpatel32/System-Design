# Design Google Drive
> **Category:** Intermediate System Design Problems

---

### Overview
**Google Drive** is a cloud storage and synchronization platform supporting block-level file chunking, delta synchronization, folder hierarchy management, and real-time collaborative file sharing.

### System Architecture Topology

```
+--------+     1. Chunk File & Upload Chunks     +-------------------+
| Client | ------------------------------------> | Ingestion Gateway |
+--------+                                       +-------------------+
    ^                                                      |
    | 5. Sync Notification                                 v 2. Store Chunks
    |                                            +-------------------+
    | <----------------------------------------- | Chunk Storage     |
    |                                            | (S3 / Blob Store) |
    |                                            +-------------------+
    |                                                      |
    v                                                      v 3. Save Metadata
+-------------------+                            +-------------------+
| Sync Service      | <------------------------- | Metadata DB       |
| (WebSockets/SSE)  |    4. Trigger Sync Event   | (Spanner / MySQL) |
+-------------------+                            +-------------------+
```

### Core API Specification

| Endpoint | Method | Request Payload | Response |
|---|---|---|---|
| `/api/v1/files/upload/init` | `POST` | `{"file_name": "report.pdf", "size": 10485760}` | `200 OK` -> `{"upload_id": "u_99", "chunk_size": 4194304}` |
| `/api/v1/files/chunks` | `PUT` | Binary chunk payload + `checksum` | `200 OK` -> `{"chunk_hash": "a8f9..."}` |
| `/api/v1/files/{id}/sync` | `GET` | `?last_version=v3` | `200 OK` -> `{"delta_chunks": [...]}` |

### Block-Level Chunking & Deduplication
Large files are split into fixed or variable-sized chunks (e.g., 4 MB blocks).
- **Chunk Hash**: SHA-256 string generated per chunk.
- **Global Deduplication**: If SHA-256 hash already exists in storage, skip upload and point metadata to existing chunk byte blob.

### Metadata Schema (Google Spanner / Relational Shards)
```json
{
  "file_id": "f_8819a",
  "user_id": "usr_9981",
  "file_name": "quarterly_presentation.pptx",
  "version": 4,
  "chunks": [
    { "index": 0, "hash": "sha256_chunk_1a2b", "size": 4194304 },
    { "index": 1, "hash": "sha256_chunk_3c4d", "size": 4194304 },
    { "index": 2, "hash": "sha256_chunk_5e6f", "size": 2097152 }
  ]
}
```

### Key takeaway
Google Drive optimizes bandwidth using **block-level chunking** (4 MB blocks) and **SHA-256 hash deduplication**, notifying client sync agents of file updates via persistent **WebSocket sync connections**.
