# Amazon S3 Style Storage

> **Category:** Storage Systems

---

S3 (Simple Storage Service) is AWS's object storage, the **de facto standard** for cloud
object storage. Other clouds have equivalents (GCS, Azure Blob) with similar APIs.

### Core operations
| Operation | What |
|-----------|------|
| `PutObject` | Upload an object |
| `GetObject` | Download |
| `DeleteObject` | Remove |
| `ListObjects` | List keys with prefix |
| `CopyObject` | Server-side copy |
| `HeadObject` | Get metadata only |

### Buckets and keys
- **Bucket**: top-level container, globally unique name.
- **Key**: object's path within bucket (`photos/cat.jpg`).
- **Region**: bucket lives in one region (replicated across AZs within).

### URL styles
- Path-style: `https://s3.amazonaws.com/bucket/key`
- Virtual-hosted: `https://bucket.s3.amazonaws.com/key`

### Permissions
- **Bucket policies** (JSON): who can do what.
- **IAM policies**: per-user / role.
- **ACLs**: legacy per-object.
- **Pre-signed URLs**: time-limited direct access.

### Features
- **Versioning**: every save creates a new version.
- **Lifecycle rules**: move to IA/Glacier, expire old.
- **Encryption**: SSE-S3 (managed), SSE-KMS (custom keys), CSE (client).
- **CORS** for browser uploads.
- **Events**: notify Lambda/SQS on PUT.
- **Transfer Acceleration**: fast global uploads via CloudFront edge.
- **Select / Glacier Select**: query within objects.

### Performance
- Single PUT: 5GB max. Use multipart for larger.
- Latency: tens of ms.
- Throughput: parallelize requests.
- **Prefix performance**: historically limited per-prefix; partitioned automatically now.

### Multi-region
- **Cross-region replication**: copy to another region for DR.
- **CloudFront in front**: cache globally.

### Key takeaway
S3 is the **standard object store**. Master buckets/keys, pre-signed URLs, lifecycle rules,
versioning, and event notifications. Pair with CloudFront for global low-latency reads.
