# Block Storage

> **Category:** Storage Systems

---

Block storage abstracts physical storage media into raw, fixed-sized contiguous chunks called **blocks** (typically 4KB or 512 bytes). Unlike file or object storage, block storage provides **no file system or directory hierarchy abstraction**; it exposes raw Logical Block Addresses (LBAs) directly to the guest operating system, which formats them with file systems like ext4, XFS, or NTFS.

### Low-Level Architecture & Block Layout

In block storage, disk controllers write raw binary blocks to storage sectors via low-level storage area networks (SAN) or direct bus interfaces.

```
+----------------------------------------------------------------------------------------------------+
|                               Application / Database System (e.g., PostgreSQL)                      |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                   Direct Block I/O (LBA 0x004A...N)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                Operating System Device Driver (e.g., /dev/sda)                     |
+----------------------------------------------------------------------------------------------------+
                                                  |
                      Low-Latency Network / Storage Bus Protocol (iSCSI / NVMe-oF / EBS)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                Block Storage Controller (SAN / Virtual Volume)                     |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+        |
| | Block 0 (4KB)      | | Block 1 (4KB)      | | Block 2 (4KB)      | | Block 3 (4KB)      |        |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+        |
+----------------------------------------------------------------------------------------------------+
```

### Storage Interface & Protocol Matrix

| Interface / Protocol | Transport Medium | Typical IOPS / Latency | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **NVMe-oF (Over Fabrics)** | Ethernet / InfiniBand | Sub-100 microseconds, 1M+ IOPS | High-Performance Distributed DBs |
| **iSCSI** | Standard IP Networks (TCP/IP) | 1-5 milliseconds, 50k-100k IOPS | Enterprise Virtualization (VMware/KVM) |
| **Fibre Channel (FC)** | Dedicated Optical SAN Cables | Sub-millisecond, High Throughput | Mission-Critical Banking Databases |
| **AWS EBS / Cloud Disks** | Cloud Hypervisor Network | Provisioned (e.g., io2: 64k IOPS) | Cloud VMs, Relational Databases |

### Key Characteristics & Mechanics

1. **Raw Sector Addressing**: Data is stored in unformatted blocks identified solely by index numbers (LBA).
2. **High-Performance Random I/O**: Delivers ultra-low latency and maximum Input/Output Operations Per Second (IOPS) suitable for heavy transactional workloads.
3. **Exclusive Volume Mounts**: Typically attached to a single host instance at a time (e.g., single-attach Cloud Elastic Block Store).
4. **Copy-on-Write Snapshots**: Provides point-in-time volume snapshots by freezing block mapping tables and duplicating modified blocks.

### Data Model & Volume Metadata Descriptor

| Attribute | Data Type | Description |
| :--- | :--- | :--- |
| `volume_id` | `UUID` | Unique identifier for the block storage volume |
| `capacity_bytes` | `UINT64` | Total provisioned size of the volume in bytes |
| `block_size` | `UINT32` | Size of individual block allocation unit (e.g., 4096 bytes) |
| `attached_node_id` | `VARCHAR(64)` | Host/Instance identifier currently mounting the raw device |
| `iops_provisioned` | `UINT32` | Allocated IOPS throughput limit |

### Trade-offs & Production Considerations

- ✅ **Maximum I/O Performance**: Eliminates metadata lookups and protocol overhead present in file/object storage.
- ✅ **Database Compatibility**: Ideal for relational databases (MySQL, PostgreSQL) and NoSQL engines requiring direct control over block flushes (`fsync`).
- ❌ **Single Instance Attachment**: Most block storage devices cannot be shared concurrently across hundreds of compute nodes.
- ❌ **High Infrastructure Cost**: Provisioning dedicated IOPS and SAN hardware incurs higher costs per gigabyte than object storage.

### Key takeaway

Block storage delivers **ultra-low latency and high random IOPS** by exposing raw storage sectors directly to operating systems and databases, making it the bedrock for performance-critical database storage.
