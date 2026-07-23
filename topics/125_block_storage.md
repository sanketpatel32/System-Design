# Block Storage

> **Category:** Storage Systems

---

Block storage = **raw disk volumes** presented to a server, like a physical hard drive. The
OS formats and uses it directly.

### How it works
```
[Server]
   |
   | iSCSI / Fibre Channel / NVMe-oF
   v
[Block storage array]  -> volumes like /dev/sdb
```
The server sees a raw device, formats with ext4 / NTFS / XFS, mounts it as a filesystem.

### Properties
- **Block-level**: read/write at the sector level (4K blocks).
- **Low latency**: often SSD/NVMe-backed.
- **Single-writer**: one server mounts a volume at a time (usually).
- **Snapshot capable**: point-in-time copies.

### Use cases
- **Database storage** (Postgres, MySQL data volumes).
- **OS boot volumes** (EC2 EBS root).
- **Anything needing a filesystem with POSIX semantics**.

### AWS EBS (typical block storage)
- Volumes attached to one EC2 instance.
- Types: gp3 (SSD), io2 (high IOPS), st1 (HDD throughput).
- Snapshots backup to S3.
- Multi-attach (one volume to multiple instances) for specialized cases.

### Pros
- ✅ **Lowest latency** storage (after local NVMe).
- ✅ **POSIX filesystem** on top.
- ✅ **Snapshot / clone** support.
- ✅ Predictable performance.

### Cons
- ❌ **Single-AZ** (usually) — not multi-region by default.
- ❌ **One writer** — can't share between instances.
- ❌ **Capacity bound** per volume.
- ❌ Pay for provisioned capacity, not used.

### vs Object Storage
| | Block | Object |
|--|-------|--------|
| Access | Block device | HTTP API |
| Semantics | POSIX | REST |
| Scale | TB per volume | PB / trillions |
| Latency | Sub-ms to ms | 10s of ms |
| Sharing | One instance | Many |

### Key takeaway
Use block storage (EBS) for **databases and single-instance workloads** needing a filesystem and
low latency. Use object storage (S3) for shared, internet-scale data.
