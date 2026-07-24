# Design Dropbox
> **Category:** Intermediate System Design Problems

---

### Overview
**Dropbox** is a pioneer in cloud storage and desktop file synchronization, engineered to synchronize local desktop directory changes with cloud storage in near real-time.

Dropbox built its architecture around **Rabin Rolling Hash Chunking**, local SQLite client database indexing, **Magic Pocket custom block storage**, and **LAN Sync**.

### System Architecture & Sync Topology

```
+--------------------------------------------------------------------------+
| DROPBOX DESKTOP CLIENT                                                   |
|  [ File Watcher ] --> [ Chunk Splitter ] --> [ Encrypt/Compress ]        |
+--------------------------------------------------------------------------+
        |                                                |
        | 1. Direct Chunk Upload                         | 2. Sync Metadata Delta
        v                                                v
+-------------------+                            +-------------------+
| Block Storage     |                            | API Gateway /     |
| (Magic Pocket)    |                            | Notification Svc  |
+-------------------+                            +-------------------+
                                                           |
                                                           v 3. Update File Index
                                                 +-------------------+
                                                 | Sync Engine & DB  |
                                                 | (Edgestore / DB)  |
                                                 +-------------------+
```

### Key Technical Mechanics
1. **Delta Sync (Rabin Rolling Hash Chunking):** Dynamically splits mutated files into variable-sized chunks (average 4 MB) using rolling hashes. If bytes are inserted at the beginning of a file, rolling hash chunk boundaries adjust, avoiding full-file re-uploading.
2. **LAN Sync (Local Network Sync):** Dropbox clients broadcast discovery packets over local Wi-Fi networks. If two devices on the same Wi-Fi network need the same file chunk, they transfer it directly peer-to-peer over LAN, bypassing the internet entirely.
3. **Magic Pocket Block Storage:** Dropbox's custom-built high-density petabyte storage infrastructure, optimized for multi-terabit immutable chunk storage at a fraction of standard cloud S3 costs.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/2/files/upload_session/start`| POST | `{"close": false}` | `{"session_id": "sess_881"}` |
| `/2/files/upload_session/append`| POST | Headers: `Dropbox-API-Arg: {"cursor": {"session_id": "sess_881", "offset": 0}}` (Chunk Binary) | `HTTP 200 OK` |
| `/2/files/list_folder/continue` | POST | `{"cursor": "cur_99120"}` | `{"entries": [{"name": "doc.pdf", "tag": "file"}], "cursor": "cur_99121"}` |

### Dropbox Metadata Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `file_journal_id` | BigInt | Edgestore (MySQL Shard) | Sequential sequence ID tracking directory file mutations. |
| `namespace_id` | String | Edgestore | Identifies user account or shared team folder namespace. |
| `block_hash` | String (SHA-256) | Edgestore | Unique content-addressable hash for 4 MB chunk block in Magic Pocket. |
| `local_sqlite_db` | SQLite File | Client Local Disk | Local client index tracking file modification timestamps and chunk hashes. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Magic Pocket Custom Storage vs AWS S3** | Massive cost savings at exabyte scale; custom hardware tuning for chunk IOPS. | Enormous upfront infrastructure cost and operational management complexity. | Exabyte-scale cloud storage operators. |
| **LAN Sync (Peer-to-Peer Local Sync)** | Ultra-fast local transfer speeds (100+ MB/s); zero internet bandwidth consumption. | Requires local network UDP discovery protocol enabled on client networks. | Office and team desktop file synchronization. |
| **Variable Rabin Rolling Chunking** | Resilient to byte insertion shifts at the beginning or middle of files. | Higher CPU processing computation overhead on client device than fixed chunking. | Advanced file synchronization engines. |

### Key takeaway
**Dropbox** minimizes bandwidth and storage overhead through **Delta Sync (Rabin Rolling Hash Chunking)**, custom **Magic Pocket exabyte block storage**, and **LAN Sync peer-to-peer local network transfer**.
