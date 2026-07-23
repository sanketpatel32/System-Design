# Multipart Upload

> **Category:** Storage Systems

---

Multipart upload = **breaking a large file into parts, uploading each independently, then
combining them.** Required for large files in S3.

### Why
- **Parallel uploads**: parts uploaded concurrently → faster.
- **Resume on failure**: retry only the failed part, not the whole file.
- **Bypass size limits**: single PUT max is 5GB; multipart can do 5TB.
- **Better reliability**: smaller parts, fewer chances to fail mid-upload.

### S3 multipart flow
```
1. Initiate:  POST /uploads  -> upload_id
2. Upload parts:
     PUT /uploads/{id}/part/1   (data, must be ≥5MB except last)
     PUT /uploads/{id}/part/2
     ...
3. Complete:  POST /uploads/{id}/complete  (with ETags of all parts)
4. S3 assembles the object.
```

### Constraints
- Min part size: **5MB** (except the last).
- Max parts: 10,000.
- Max object size: 5TB.
- Max single PUT: 5GB.

### Choosing part size
- Smaller parts (5-100MB): more parallelism, more overhead.
- Larger parts (100MB-5GB): less overhead, harder to retry.
- Sweet spot: 50-100MB for most files.

### Aborting
- Always abort incomplete multipart uploads → they incur storage costs.
- Lifecycle rule: auto-abort after 7 days.

### Use cases
- Video / large document uploads.
- Mobile / flaky networks (resume per part).
- Parallel upload from multiple threads.

### Key takeaway
For files > 100MB, use **multipart upload** — parallel, resumable, bypasses size limits. Always
clean up incomplete uploads (they cost money). Most SDKs do this transparently above a size
threshold.
