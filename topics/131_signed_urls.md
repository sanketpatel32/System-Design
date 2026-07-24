# Signed URLs

> **Category:** Storage Systems

---

A signed URL (also known as a Presigned URL) is a cryptographic URL that grants **temporary, permission-restricted access** to perform a specific storage operation (`GET`, `PUT`, `DELETE`) on an object without requiring client authentication headers or AWS/Cloud IAM credentials.

### Cryptographic Signing Flow

The application server authenticates the client, signs the object request parameters using its private secret key (e.g. AWS HMAC SHA-256 SigV4), and returns a signed URL. The client interacts directly with the Object Store/CDN.

```
+----------+      1. Authenticate Request & Ask Presigned URL      +--------------------+
| Client   | ----------------------------------------------------> | API Gateway / App  |
| App      | <---------------------------------------------------- | Server Backend     |
+----------+        2. Return Signed URL (Expires in 15 mins)       +--------------------+
     |                                                                        |
     |                                                       Generates HMAC-SHA256 SigV4 Token
     | 3. Direct HTTP GET / PUT with Presigned URL Token                      |
     v                                                                        v
+-----------------------------------------------------------------------------------------------+
|                                Cloud Object Storage / CDN Edge                                |
| - Validates HMAC Signature against Storage Key Secret                                         |
| - Checks Epoch Expiration Timestamp (`X-Amz-Expires`)                                         |
| - Stream binary payload directly client <-> storage                                           |
+-----------------------------------------------------------------------------------------------+
```

### Key Parameters in a Signed URL

| Parameter Key | Purpose | Example Value |
| :--- | :--- | :--- |
| `X-Amz-Algorithm` | Cryptographic signing hashing algorithm | `AWS4-HMAC-SHA256` |
| `X-Amz-Credential` | Access Key ID, region, and service scope string | `AKIAIOSFODNN7EXAMPLE/20260724/us-east-1/s3/aws4_request` |
| `X-Amz-Date` | ISO 8601 creation timestamp in UTC | `20260724T120000Z` |
| `X-Amz-Expires` | Time-to-live expiration duration in seconds | `900` (15 minutes) |
| `X-Amz-SignedHeaders`| Mandated headers included during HMAC generation | `host;content-type` |
| `X-Amz-Signature` | Calculated HMAC SHA-256 hex signature digest | `7364abc1293847fed...` |

### Access Control Comparison Matrix

| Security Pattern | Credential Scope | Application Bottleneck | Expiration Flexibility | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Signed URL** | Single Object / Operation | None (Direct Storage Stream) | Per-URL TTL (e.g., 5 mins) | User media upload/download |
| **Signed Cookie** | Multiple Files / Folder Domain | None (Direct Edge Access) | Domain Session TTL | Streaming entire HLS video streams |
| **Proxying via App**| Backend Credentials exposed | Heavy (App CPU/Network bottleneck) | App-managed | Complex on-the-fly authorization |

### Key Trade-offs & Security Rules

- ✅ **Offloads Application Bandwidth**: Application servers never process heavy media streams; traffic flows directly between client and cloud storage.
- ✅ **Least Privilege Security**: Users receive short-lived permissions limited strictly to one object key and HTTP verb.
- ❌ **URL Leakage Risk**: Anyone possessing the signed URL can access the resource until `X-Amz-Expires` elapses. Keep expiration short (e.g., 5-15 minutes).
- ❌ **Header Mismatch Errors**: If signed headers (e.g., `Content-Type`) do not match the exact HTTP headers sent by the client browser, storage engines reject the request with `403 Forbidden`.
### Concrete Code Pattern (AWS S3 Presigned URL Generation)

```python
import boto3
from botocore.exceptions import ClientError

def generate_presigned_upload_url(bucket_name, object_key, expiration=900):
    s3_client = boto3.client('s3', region_name='us-east-1')
    try:
        response = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': object_key,
                'ContentType': 'image/png'
            },
            ExpiresIn=expiration # 15 minutes TTL
        )
        return response
    except ClientError as e:
        print(f"Error generating signed URL: {e}")
        return None
```

### Production Security & Failure Scenarios

1. **Browser CORS Preflight Failure**: Browsers issuing `OPTIONS` requests before uploading via a signed URL require S3 buckets to explicitly configure Cross-Origin Resource Sharing (CORS) rules allowing the target domain and headers.
2. **Signature Mismatch on Custom Headers**: If the application server includes `x-amz-meta-user-id` in the signed signature, but the client JS fails to include that exact header during the upload, S3 returns a `403 Forbidden` error.

### Key takeaway

Signed URLs grant **temporary, delegated access to private cloud storage**, enabling direct client-to-storage transfers that bypass backend application bottlenecks while enforcing cryptographically signed authorization.
