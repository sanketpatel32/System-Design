# Signed URLs

> **Category:** Storage Systems

---

A signed URL (or presigned URL) provides **temporary, cryptographically signed access** to a specific storage resource without requiring clients to possess IAM credentials or route data through application servers.

### Architectural Sequence Diagram

```
+--------+              +----------------------+              +----------------+
| Client |              | App Auth Server      |              | Storage (S3)   |
+--------+              +----------------------+              +----------------+
    |                               |                                  |
    | 1. Request Upload Permission  |                                  |
    |------------------------------>|                                  |
    |                               | 2. Verify IAM & Create HMAC      |
    |                               |    Signed URL (TTL = 15m)       |
    |<------------------------------|                                  |
    | Returns Presigned PUT URL     |                                  |
    |                                                                  |
    | 3. Upload File Directly (HTTP PUT with Signed Query Params)      |
    |----------------------------------------------------------------->|
    |<-----------------------------------------------------------------|
    | Returns 200 OK (Data bypasses App Server entirely!)             |
```

### Presigned URL Security Anatomy

Presigned URLs append authentication criteria directly into HTTP URL query parameters:

```
https://my-bucket.s3.amazonaws.com/uploads/photo.jpg
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20260724%2Fus-east-1%2Fs3%2Faws4_request
  &X-Amz-Date=20260724T120000Z
  &X-Amz-Expires=900
  &X-Amz-SignedHeaders=host
  &X-Amz-Signature=a3b8f... (Cryptographic HMAC Hash)
```

### Direct Access Strategy Matrix

| Strategy | Payload Data Route | App Server Load | Granular Expiration | Security Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Signed URLs** | Client -> Storage | Minimal (Auth only) | Yes (e.g., 5 to 60 minutes)| Single File/Object |
| **Signed Cookies** | Client -> Storage / CDN | Minimal (Auth only) | Yes | Multiple Files / Path Prefix |
| **Proxy Gateway** | Client -> Server -> Storage | Extreme (Double Egress) | N/A (Server Session) | Full Application Control |

### Key Security Best Practices

- **Short Time-To-Live (TTL)**: Restrict expiration intervals to the minimum operational window (e.g., 5–15 minutes).
- **Enforce Headers**: Sign `Content-Type` and `Content-Length` headers so clients cannot upload unauthorized executable file types or massive payload sizes.
- **CORS Configuration**: Restrict allowed HTTP origins on storage buckets to trusted application domains.

### Key takeaway

Signed URLs offload **large data transfers from application servers** by issuing short-lived, cryptographically signed HTTP authorization tokens for direct client-to-storage interactions.
