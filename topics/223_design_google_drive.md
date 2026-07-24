# Design Google Drive
> **Category:** Intermediate System Design Problems

---

### Overview
**Google Drive** is a cloud file storage and synchronization platform supporting file storage, version history, folder organization, and real-time collaborative editing (Google Docs).

The system handles petabytes of data using **4 MB Block-Level Chunking**, content-addressable storage deduplication, delta synchronization, and real-time notification streams.

### System Architecture & Sync Engine Topology

```
+--------------------+     1. File Mutation (Modified Document)   +--------------------+
| Google Drive       | -----------------------------------------> | Sync Engine &      |
| Desktop Client     |                                            | Chunk Splitter     |
+--------------------+                                            +--------------------+
         ^                                                                  |
         | 5. Sync Notification                                             | 2. Hash 4MB Chunks (SHA-256)
         +---------------------------------------------------               v
                                                             +--------------------+
                                                             | Chunk Storage &    |
                                                             | Deduplication Engine|
                                                             +--------------------+
                                                               /                \
                                     3. If Chunk Exists       /                  \ 4. New Chunk Upload
                                     (Skip Upload)           v                    v
                                                    +------------------+  +--------------------+
                                                    | Metadata DB      |  | Colossus Blobstore |
                                                    | (Spanner DB)     |  | (Google Cloud S3)  |
                                                    +------------------+  +--------------------+
```

### Key Technical Mechanics
1. **4 MB Block-Level Chunking:** Files are split into fixed 4 MB block chunks. When a 1 GB file is modified slightly, only the modified 4 MB blocks are uploaded, saving 99% of network bandwidth.
2. **Content-Addressable Storage (CAS) Deduplication:** Each 4 MB chunk is indexed by its SHA-256 hash. If multiple users upload identical files or chunks, Google Drive stores the chunk **only once** in Colossus Blobstore, mapping multiple metadata pointers to the single stored block.
3. **Delta Synchronization Engine:** Compares local client chunk hashes against server metadata to compute exact chunk diffs before initiating transfer.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v3/files/upload` | POST | `{"name": "report.pdf", "parent_folder_id": "f_99", "chunks": ["sha256_1", "sha256_2"]}` | `{"file_id": "file_881", "missing_chunks": ["sha256_2"]}` |
| `/api/v3/files/{id}/sync` | GET | `{"local_version": 14}` | `{"server_version": 15, "diff_chunks": ["sha256_9"]}` |

### Metadata & Block Storage Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `file_id` | String (UUID) | Google Spanner DB | Primary Key for file metadata record. |
| `folder_id` | String | Spanner DB | Parent directory node ID for file tree hierarchy. |
| `version` | Integer | Spanner DB | Monotonically increasing file revision version. |
| `chunk_sha256` | String (Indexed) | Spanner DB | Content-addressable key mapping to physical block storage location. |
| `ref_count` | Integer | Spanner DB | Reference counter tracking deduplication usage (Block deleted when `ref_count = 0`). |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **4 MB Block Chunking & Deduplication**| Reduces storage requirements by terabytes; accelerates delta file updates. | Indexing overhead; assembling fragmented chunks on file download requires disk read IOPS. | Cloud file sync platforms (Google Drive, Dropbox). |
| **Google Spanner Distributed Relational DB**| Globally consistent ACID transactions; eliminates metadata sync conflicts across regions. | Higher latency on cross-region writes compared to eventually consistent NoSQL stores. | Global file metadata and directory hierarchy storage. |
| **Delta Synchronization** | Transfers only mutated file bytes over network. | Requires local SQLite client database index tracking chunk hashes. | Desktop and mobile file sync clients. |

### Key takeaway
**Google Drive** optimizes network bandwidth and storage efficiency by splitting files into **4 MB chunks**, deduplicating blocks via **SHA-256 Content-Addressable Storage**, and syncing metadata using **Google Spanner**.
