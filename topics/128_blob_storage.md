# Blob Storage

> **Category:** Storage Systems

---

Blob (Binary Large Object) storage stores massive quantities of **unstructured binary data** (videos, audio, medical images, VM disk snapshots) categorized into distinct blob access patterns.

### Blob Architectural Variants

Systems like Azure Blob Storage categorize data into distinct blob types optimized for specific access workloads.

```
                                  +-------------------+
                                  |   Blob Storage    |
                                  +-------------------+
                                            |
        +-----------------------------------+-----------------------------------+
        |                                   |                                   |
        v                                   v                                   v
+---------------+                   +---------------+                   +---------------+
|  Block Blobs  |                   |  Append Blobs |                   |   Page Blobs  |
| Optimized for |                   | Optimized for |                   | Optimized for |
| Parallel Upload|                  | Fast Appends  |                   | Random Read/W |
+---------------+                   +---------------+                   +---------------+
```

### Blob Types & Operational Comparison

| Blob Type | Structure | Max Size | Primary Workload / Use Case |
| :--- | :--- | :--- | :--- |
| **Block Blob** | Array of blocks (up to 100MB per block) | ~190.7 TB | Media files, documents, web assets |
| **Append Blob**| Optimized for sequential block appends | ~195 GB | Application log aggregation, audit logs |
| **Page Blob** | 512-byte random-access page collections | 8 TB | Virtual Machine VHD disks, database files |

### Security & Access Control

- **Shared Access Signatures (SAS)**: Time-bound tokens granting granular permissions (Read, Write, Delete) restricted to specific IP ranges.
- **Immutability Policies (WORM)**: Write Once, Read Many locks preventing deletion or modification for regulatory compliance.

### System Optimization Patterns

- **CDN Integration**: Edge caching for hot Block Blobs to reduce bandwidth egress costs.
- **Lifecycle Management Policies**: Automated JSON rules that transition blobs from Hot -> Cool -> Archive tiers based on `lastModified` age.

### Key takeaway

Blob storage supports diverse data patterns via **Block, Append, and Page abstractions**, providing flexible storage optimization for logs, media assets, and virtual disks.
