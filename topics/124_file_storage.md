# File Storage

> **Category:** Storage Systems

---

File storage presents data in a **hierarchical tree structure of folders and files**, accessed through standard POSIX file system interfaces over networks (e.g., NFS, SMB/CIFS).

### Architecture Overview

File storage abstracts disk blocks into human-readable paths with directory hierarchies, metadata attributes (permissions, timestamps, file size), and file locks.

```
+-----------------------------------------------------------------------------------+
|                            Client Application / OS                                |
+-----------------------------------------------------------------------------------+
                                          | POSIX (open, read, write, close)
                                          v
+-----------------------------------------------------------------------------------+
|                        Network File Protocol (NFS / SMB)                          |
+-----------------------------------------------------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             +---------------------+             +---------------------+
             | Metadata Server     |             | Data Storage Server |
             | (Inodes, Tree Path) |             | (File Payloads)     |
             +---------------------+             +---------------------+
```

### Technical Attributes & API Capabilities

- **Hierarchical Namespace**: Files are referenced via absolute path paths (e.g., `/var/log/app/output.log`).
- **File Locking**: Supports shared and exclusive locks (`flock`) to prevent concurrent write corruption.
- **Shared Access**: Multiple compute nodes can mount the same file system concurrently.

### Storage System Matrix

| Dimension | File Storage | Block Storage | Object Storage |
| :--- | :--- | :--- | :--- |
| **Data Organization** | Hierarchical Tree | Raw Fixed Blocks | Flat Namespace |
| **Access Protocol** | NFS, SMB/CIFS, POSIX | iSCSI, Fibre Channel, NVMe | HTTP REST (GET, PUT, DELETE) |
| **Latency** | Low (Milliseconds) | Ultra-Low (Sub-millisecond) | Medium (Tens of ms) |
| **Scalability** | Moderate (PB Scale) | Fixed Volume Capacity | Massive (EB Scale) |
| **Best For** | Shared App Files, Legacy Apps | Database Data Files, VM Disks | Unstructured Media, Data Lakes |

### System Design Trade-offs

- ✅ **POSIX Compatibility**: Legacy software works out-of-the-box without rewriting storage code.
- ✅ **Shared Access**: Ideal for multi-server workloads needing simultaneous read/write to shared directories.
- ❌ **Scalability Limits**: Heavy directory traversal overhead and lock contention slow down operations at millions of files.

### Key takeaway

File storage provides **POSIX-compliant shared access with hierarchical paths**. It is ideal for shared application state, legacy enterprise migrations, and content management systems, but scales less efficiently than object storage for billions of files.
