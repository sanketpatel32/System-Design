# File Storage

> **Category:** Storage Systems

---

File storage = **a hierarchical filesystem** (directories and files) accessed via protocols
like NFS, SMB, or POSIX.

### How it works
```
/shared/
  docs/
    report.pdf
    notes.txt
  images/
    logo.png
```
Files organized in a tree of folders. Network protocols (NFS, SMB) let multiple servers mount
the same filesystem.

### Properties
- **Hierarchical**: directories contain files and subdirectories.
- **POSIX semantics**: permissions, locks, atomic rename.
- **Shared access**: multiple clients mount same volume.
- **Block-based underneath**: typically backed by a SAN or NAS.

### Use cases
- Home directories.
- Shared configuration.
- Legacy enterprise apps expecting a filesystem.
- CMS media folders.

### Pros
- ✅ Familiar (every OS has one).
- ✅ POSIX semantics (locking, atomic rename).
- ✅ Good for small files and structured data.

### Cons
- ❌ **Hard to scale**: single namespace, metadata bottleneck.
- ❌ **Single region** typically.
- ❌ **Metadata overhead** for billions of small files.
- ❌ **Performance** degrades at scale.

### Common implementations
- **NFS** (Linux, traditional).
- **SMB / CIFS** (Windows).
- **Amazon EFS** (managed NFS).
- **Azure Files**.

### When NOT to use
- Massive scale (petabytes, billions of objects) → object storage.
- Need geographic distribution → object storage + CDN.
- Very high throughput → block storage + custom app.

### Key takeaway
File storage is the **familiar hierarchical model**, great for shared folders and legacy apps.
Don't use it for internet-scale storage — object storage (S3) scales better.
