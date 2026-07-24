# Design Dropbox
> **Category:** Intermediate System Design Problems

---

### Overview
**Dropbox** is a file synchronization and storage service pioneered on delta synchronization, local block storage caching, LAN sync, and scalable cloud metadata indexing.

### System Architecture Diagram

```
+--------------------------------------------------------------------------+
|                              DROPBOX CLIENT                              |
|  [ File Watcher ] --> [ Chunk Splitter ] --> [ Compression & Encryption] |
+--------------------------------------------------------------------------+
        |                                                |
        v Direct Chunk Upload                            v Metadata / Sync Delta
+-------------------+                            +-------------------+
| Block Storage     |                            | API Gateway       |
| (AWS S3 / Magic)  |                            +-------------------+
+-------------------+                                      |
                                                           v
                                                 +-------------------+
                                                 | Sync Engine / DB  |
                                                 | (Edgestore / DB)  |
                                                 +-------------------+
```

### Key Technical Capabilities

| Feature | Technical Strategy |
|---|---|
| **Delta Sync** | Syncs strictly modified 4 MB blocks rather than uploading entire mutated files. |
| **LAN Sync** | Client broadcasts discovery packets on local Wi-Fi to sync chunks directly device-to-device without internet bandwidth consumption. |
| **Block Caching** | Local SQLite index tracks local chunk hashes to verify sync state instantly. |

### Comparison: Dropbox vs Google Drive Architecture

| Feature | Dropbox | Google Drive |
|---|---|---|
| **Primary Focus** | Ultra-fast desktop background file sync | Real-time browser collaborative document editing |
| **Sync Optimization**| High-performance native desktop client C++ chunking | Browser-first streaming uploads |
| **Storage Architecture**| Custom block storage system ("Magic Pocket") | Google Colossus / Blobstore |

### Key takeaway
Dropbox minimizes network bandwidth by executing **delta sync** (transmitting only modified 4 MB blocks) and utilizing **LAN Sync** for local network device peer-to-peer synchronization.
