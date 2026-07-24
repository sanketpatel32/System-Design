# Multipart Upload

> **Category:** Storage Systems

---

Multipart upload is a strategy that breaks large files into **smaller data chunks (parts)**, uploads them concurrently over network channels, and reassembles them atomically on the storage target.

### Protocol Sequence Diagram

```
+--------+            +--------------------+            +---------------+
| Client |            | App Gateway / API  |            | Object Store  |
+--------+            +--------------------+            +---------------+
    |                           |                               |
    | 1. Initiate Multipart     |                               |
    |-------------------------->| Request Upload ID             |
    |                           |------------------------------>|
    |                           |<------------------------------| Returns UploadId: 99x
    |<--------------------------| Return UploadId               |
    |                           |                               |
    | 2. Upload Parts Parallel  |                               |
    |--- Part 1 (Bytes 0-5MB) ->|------------------------------>| Returns ETag: "e1"
    |--- Part 2 (Bytes 5-10MB)->|------------------------------>| Returns ETag: "e2"
    |--- Part 3 (Bytes 10-15MB)->|------------------------------>| Returns ETag: "e3"
    |                           |                               |
    | 3. Complete Multipart     |                               |
    |-------------------------->| Send UploadId + Part/ETag List|
    |                           |------------------------------>| Reassemble Object
    |<--------------------------| Return 200 OK                 |
```

### Multipart Upload Lifecycle API

| API Action | HTTP Method | Input Parameters | Return Payload |
| :--- | :--- | :--- | :--- |
| **InitiateUpload** | `POST` | `filename`, `content_type`, `size` | `UploadId` |
| **UploadPart** | `PUT` | `UploadId`, `partNumber`, `Chunk Data` | `ETag` (MD5 Checksum) |
| **CompleteUpload** | `POST` | `UploadId`, `[{partNumber, ETag}]` | `200 OK` (Final S3 Object URL) |
| **AbortUpload** | `DELETE` | `UploadId` | `240 No Content` (Cleans temporary parts) |

### Key Benefits & Failure Mitigation

- ✅ **Resumable Uploads**: If part 4 fails out of 100, only part 4 needs re-transmission.
- ✅ **Parallel Throughput**: Utilizes multiple TCP streams to maximize internet client bandwidth.
- ✅ **Memory Efficiency**: Senders stream chunks sequentially from disk without loading multi-gigabyte files into RAM.
- ❌ **Orphaned Parts Cost**: Incomplete uploads consume storage. Systems set lifecycle rules to auto-abort uploads after 7 days.

### Key takeaway

Multipart upload enables **fast, reliable uploads of large files** by parallelizing chunk delivery and isolating retry operations to individual failed parts.
