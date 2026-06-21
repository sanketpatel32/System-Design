# Design Cloud Storage

> **Category:** Advanced System Design Problems

---

Design S3-like object storage.

### Requirements
- **Functional**: PUT/GET/DELETE objects; list bucket.
- **Non-functional**: 11 nines durability; high availability; cheap.

### Architecture
```
[Client] -> [API] -> [Metadata service]
                     [Storage nodes (with replication)]
```

### Object storage vs filesystem
- Flat namespace (bucket + key).
- No directories, no POSIX.
- HTTP API.

### Storage layer
- Objects split into chunks (e.g. 64KB-1MB).
- Each chunk replicated to N disks/N racks/N AZs.
- Erasure coding for space efficiency.

### Durability
- Replication: 3 copies.
- Erasure coding: data + parity (e.g. 10 data + 4 parity).
- Checksums per chunk (detect bit rot).
- Background scrubbing.

### Metadata service
- Maps bucket+key → chunk IDs.
- Fast lookups.
- Highly available.

### Consistency
- Strong read-after-write (modern S3).
- Older S3: eventual for overwrite.

### Lifecycle
- Tiering: hot → IA → Glacier.
- Auto-expire.

### Key takeaway
Cloud storage = flat namespace + chunked + replicated/erasure-coded + checksums + lifecycle
tiering. 11 nines durability via replication. HTTP API. Erasure coding for efficiency.
