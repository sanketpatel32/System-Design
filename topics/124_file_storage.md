# File Storage

> **Category:** Storage Systems

---

File storage (also known as File-Based Storage or Network-Attached Storage - NAS) organizes data into a **hierarchical tree of folders, directories, and files**. It presents files to operating systems and applications using standardized **POSIX file system APIs**, supporting byte-range reads/writes, file locking, and directory hierarchy traversals.

### Architecture & Hierarchical System Structure

In file storage, files are accessed via hierarchical paths (`/usr/local/data/image.jpg`). The file system controller translates path lookups into Inode data structures and physical disk block locations.

```
+---------------------------------------------------------------------------------------------------+
|                                  Client Operating System / POSIX API                             |
+---------------------------------------------------------------------------------------------------+
                                                  |
                         POSIX Calls (open, read, write, flock, readdir)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      Virtual File System (VFS)                                    |
+---------------------------------------------------------------------------------------------------+
                                                  |
              +-----------------------------------+-----------------------------------+
              | Network Protocol Layer (NFS / SMB / CIFS)                             |
              +-----------------------------------+-----------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                         NAS Controller / Hierarchical File System Engine                          |
|  Root (/) ---> /home ---> /user1 ---> file.txt [Inode 4021: Permissions, Size, Pointer Block]    |
+---------------------------------------------------------------------------------------------------+
```

### POSIX Semantics & Key Characteristics

- **Hierarchical Pathing**: Files are uniquely identified by human-readable nested directory paths.
- **Shared Access Protocols**: Supported across network boundaries using **NFS (Network File System)** for Linux/Unix and **SMB/CIFS** for Windows.
- **File Locks**: Provides shared read locks (`LOCK_SH`) and exclusive write locks (`LOCK_EX`) via POSIX `flock` or `fcntl`.
- **In-Place File Mutations**: Supports partial byte updates, random writes, and appends without rewriting the entire file payload.

### Storage Paradigm Comparison Matrix

| Feature | File Storage (NAS) | Block Storage (SAN) | Object Storage (S3) |
| :--- | :--- | :--- | :--- |
| **Data Organization** | Hierarchical Tree | Raw Addressable Sectors (LBAs) | Flat Key-Value Store |
| **Access Interface** | POSIX APIs (NFS, SMB) | Fibre Channel, iSCSI, NVMe | HTTP REST API (GET, PUT) |
| **Metadata** | Basic (POSIX permissions, dates) | Minimal (Sector offsets) | Rich User-Defined Custom Headers |
| **Modification** | In-Place Partial Update | In-Place Sector Update | Immutable (Full Overwrite) |
| **Scalability Limit** | Terabytes to Petabytes | Terabytes to Petabytes | Exabytes (Virtually Unlimited) |
| **Cost per GB** | Moderate / High | High | Low |

### Inode Data Model Schema

| Metadata Attribute | Data Type | Description |
| :--- | :--- | :--- |
| `inode_number` | `UINT64` | Unique internal file system identifier |
| `file_permissions` | `UINT16` | Octal permission mask (e.g., `0644` rwxr-xr-x) |
| `owner_uid / gid` | `UINT32` | User ID and Group ID of the file owner |
| `file_size` | `UINT64` | File payload size in bytes |
| `timestamps` | `TIMESTAMP` | Created (`ctime`), Modified (`mtime`), Accessed (`atime`) |
| `block_pointers` | `ARRAY[INT64]`| Direct and indirect block pointers to underlying physical sectors |

### Trade-offs & Production Considerations

- ✅ **Shared Network File Access**: Multiple compute nodes can concurrently mount, read, and write to the same shared directory.
- ✅ **Legacy Compatibility**: Applications written for standard OS file systems work seamlessly without API modification.
- ❌ **Metadata Bottleneck**: Traversing deep directory trees with millions of small files creates heavy lock contention on directory Inodes.
- ❌ **Scalability Limits**: Difficult to scale globally across multiple cloud regions while maintaining strict POSIX locks.

### Key takeaway

File storage provides **hierarchical directory structures and POSIX shared file access**. It is ideal for shared application configurations, legacy enterprise software, and shared developer workspaces, but suffers from metadata bottlenecks at extreme scale.
