# Block Storage

> **Category:** Storage Systems

---

Block storage splits raw storage capacity into **fixed-size storage chunks (blocks)**, each with a unique address. The operating system formats these blocks with a file system and treats the volume like an attached physical hard drive.

### Architecture & Low-Level Mechanics

Block storage abstracts underlying physical drives into logical volumes (LUNs) attached over high-speed networks (SAN or cloud hypervisors) using protocols such as iSCSI, Fibre Channel, or NVMe-oF.

```
+-----------------------------------------------------------------------------------+
|                      Database Engine / Virtual Machine OS                         |
|                 (File System Layer: ext4, xfs, NTFS formatted)                    |
+-----------------------------------------------------------------------------------+
                                          | Block I/O Operations (Read/Write Sector)
                                          v
+-----------------------------------------------------------------------------------+
|                    Storage Controller / HBA (NVMe-oF / iSCSI)                     |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
    +-----------------------+                           +-----------------------+
    | Block 0x00A1 (4 KB)   |                           | Block 0x00A2 (4 KB)   |
    +-----------------------+                           +-----------------------+
    | High-Speed SSD Array  |                           | High-Speed SSD Array  |
    +-----------------------+                           +-----------------------+
```

### Storage Characteristics & Performance Metrics

- **Granular Control**: Applications can write directly to raw block sectors without file system overhead.
- **Ultra-Low Latency**: Delivers sub-millisecond access times and high IOPS (Input/Output Operations Per Second).
- **Single Instance Attachment**: Most block volumes attach to one compute instance at a time (POSIX multi-attach is rare and requires cluster file systems).

### Block Storage Performance Comparison

| Type / Tier | Protocol | Target IOPS | Typical Latency | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Local NVMe SSD** | PCIe Direct | 100,000+ IOPS | < 100 µs | High-performance caches, ephemeral DBs |
| **Cloud Provisioned IOPS**| iSCSI / NVMe-oF | 10,000 - 256,000 IOPS | < 1 ms | Production RDBMS (PostgreSQL, Oracle) |
| **Cloud General Purpose**| Virtualized SAN | 3,000 - 16,000 IOPS | 1 - 3 ms | Web servers, dev/test environments |

### Key Trade-offs

- ✅ **Maximum Performance**: Low latency and high throughput necessary for transactional databases.
- ✅ **Random Write Efficiency**: Allows modifying tiny 4KB blocks within huge files without rewriting the whole file.
- ❌ **Higher Cost**: Expensive per gigabyte compared to object or file storage.
- ❌ **Limited Reach**: Cannot be accessed directly via internet HTTP APIs.

### Key takeaway

Block storage delivers **sub-millisecond performance and raw volume access**, making it the primary storage abstraction for high-throughput transactional databases and virtual machine disks.
