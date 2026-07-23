# Object Storage

> **Category:** Storage Systems

---

Object storage = **flat namespace of objects (files) in buckets**, accessed via HTTP API.
Built for internet scale.

### How it works
```
Bucket: my-files
  /photos/cat.jpg          (object key = path)
  /photos/dog.jpg
  /docs/report.pdf
```
- No real directories — keys just contain slashes.
- Each object: data + metadata + version + ACL.
- Access via HTTP: `GET/PUT/DELETE https://bucket.s3.amazonaws.com/key`.

### Properties
- **HTTP-native**: REST API.
- **Massive scale**: trillions of objects, exabytes.
- **Eventually consistent** (mostly strong now in S3).
- **Durable**: 11 nines (data replicated across AZs).
- **Cheap**: $0.023/GB/month for S3 standard.

### Use cases
- **User uploads** (images, videos, documents).
- **Backups** and archives.
- **Static website hosting**.
- **Data lake** (raw data for analytics).
- **ML training datasets**.

### Storage classes (lifecycle)
| Class | Use | Cost |
|-------|-----|------|
| Standard | Hot | $0.023/GB |
| Infrequent Access (IA) | Occasional | $0.0125/GB |
| Glacier | Archive | $0.004/GB |
| Glacier Deep Archive | Long-term | $0.00099/GB |

Lifecycle rules move data: hot → IA → Glacier automatically.

### Pros
- ✅ **Infinite scale**.
- ✅ **Cheap**.
- ✅ **Durable** (11 nines).
- ✅ **HTTP API** — universal.
- ✅ **Lifecycle / tiering** built-in.

### Cons
- ❌ **No POSIX** — no rename, no partial write.
- ❌ **Eventual consistency** (older S3; mostly strong now).
- ❌ **Latency** — tens of ms (not for DBs).
- ❌ **Listing** large buckets is slow.

### Key takeaway
Object storage (S3, GCS, Azure Blob) is the **default for internet-scale data**. Cheap, durable,
HTTP-accessible. Use it for user uploads, backups, archives, data lakes. Don't use it for
databases.
