# Blob Storage

> **Category:** Storage Systems

---

Blob storage = **another name for object storage**, especially in Azure ("Azure Blob
Storage"). Same concept as S3.

### Why two names
- AWS: S3 (object storage).
- Azure: Blob Storage.
- GCP: Cloud Storage.
- Generic term: blob = "binary large object."

### Azure Blob tiers
- **Hot**: frequent access.
- **Cool**: infrequent (30-day retention).
- **Archive**: rare (180-day retention).

### Differences from S3
- Azure uses **storage accounts** as the top-level container (vs buckets).
- **Containers** inside storage accounts hold blobs.
- URL: `https://<account>.blob.core.windows.net/<container>/<blob>`

### Use cases (same as object storage)
- Media (images, videos).
- Backups.
- Logs.
- ML data.
- Static hosting.

### Choosing
Most teams pick whatever cloud they're already in. The concepts are identical: buckets,
objects, HTTP API, lifecycle tiers.

### Key takeaway
"Blob storage" = object storage in Azure terminology. Same model as S3. Pick by cloud — concepts
are identical.
