# Design Google Drive

> **Category:** Intermediate System Design Problems

---

Design Google Drive: file storage, sync across devices, sharing, collaboration.

### Requirements
- **Functional**: upload/sync files; share; collaborate (Docs); versioning.
- **Non-functional**: cross-device sync; real-time collaboration.

### Architecture
```
[Client] <-> [Sync service] <-> [Metadata DB]
              [Block service]   [S3 (blocks)]
              [Notification (WebSocket)]
```

### Chunking
- Files split into **blocks** (4MB).
- Only changed blocks synced.
- Hash each block for dedup.

### Sync
- Client watches filesystem.
- Sends changed blocks to server.
- Server pushes notifications to other devices.

### Collaboration (Docs)
- Operational Transform or CRDTs.
- Edits merged in real-time.

### Versioning
- Snapshot of block list per version.
- Restore = reassemble blocks.

### Data model
```
files (id, owner, name, parent_id)
blocks (id, hash, size, s3_key)
file_blocks (file_id, block_id, version, position)
```

### Key takeaway
Google Drive = **block-level sync** (4MB chunks, hash-based dedup) + versioning + real-time
collaboration (CRDTs). Only changed blocks sync, saving bandwidth.
