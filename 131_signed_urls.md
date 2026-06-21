# Signed URLs

> **Category:** Storage Systems

---

A signed URL = **a temporary, token-authorized URL** giving a client direct access to an
object in S3/GCS/Azure, bypassing your app.

### Why
- Without signed URLs: client → your app → S3 (your app proxies bytes — wastes bandwidth and
  CPU).
- With signed URLs: client → S3 directly (your app is unburdened).

### Flow
```
1. Client:    "I want to download photo X."
2. Your app:  generates signed URL (valid for 5 min).
3. Client:    downloads directly from S3 via the signed URL.
4. S3:        verifies signature, serves object.
```

### Generation
```python
url = s3.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'photos', 'Key': 'cat.jpg'},
    ExpiresIn=300   # 5 minutes
)
```

### Use cases
- **Downloads**: let users download files directly from S3.
- **Uploads**: let users upload directly (POST pre-signed) without going through your app.
- **Temporary sharing**: share a private file with someone for a limited time.
- **Mobile apps**: reduce app server bandwidth.

### Security
- **TLS** mandatory.
- **Short TTL** (5-15 min) limits exposure.
- **Scoped** to a specific object + HTTP verb.
- Signed by your IAM credentials; can't be forged.

### Trade-offs
- ✅ Offloads bandwidth from your app.
- ✅ Fast (direct from S3).
- ❌ Client must handle errors (S3 returns them, not your API).
- ❌ Can't run app-level logic (auth, logging) on the request.

### Hybrid pattern
- App handles auth and decides "is this user allowed?".
- If yes, returns signed URL → client downloads directly.

### Key takeaway
Use **signed URLs** to let clients upload/download objects directly from S3, bypassing your app.
App does auth, returns short-TTL URL; S3 does the bytes. Saves bandwidth and CPU.
