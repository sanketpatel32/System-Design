# Multipart Upload

> **Category:** Storage Systems

---

Multipart upload is a mechanism for uploading large objects into object storage by **splitting the object into smaller, discrete parts** (typically 5MB to 5GB each). These parts are uploaded independently and concurrently, and then assembled into a single object on completion.

### Multipart Upload Architectural Flow

The multipart upload protocol breaks a single large payload into parallel stream uploads across multiple client network workers.

```
+---------------+       1. Initiate Multipart Upload       +------------------------+
| Client App    | ---------------------------------------> | Object Storage Gateway |
| (10GB File)   | <--------------------------------------- | (Returns UploadId)     |
+---------------+              Upload ID                   +------------------------+
        |
        | 2. Split File & Upload Parts in Parallel
        +-----------------------+-----------------------+
        |                       |                       |
        v (Part 1: 0-100MB)     v (Part 2: 100-200MB)   v (Part N: 9.9-10GB)
+-----------------------+ +-----------------------+ +-----------------------+
| PUT /part?partNumber=1| | PUT /part?partNumber=2| | PUT /part?partNumber=N|
+-----------------------+ +-----------------------+ +-----------------------+
        |                       |                       |
        +-----------------------+-----------------------+
                                |
                                v 3. Complete Multipart Upload (ETag List)
                        +------------------------+
                        | Object Storage Gateway | ---> Assembles Object Atomically
                        +------------------------+
```

### Step-by-Step Upload Protocol & State Machine

1. **Initiate**: Client invokes `InitiateMultipartUpload`. Storage engine creates an `UploadId` tracking session state.
2. **Upload Parts**: Client splits file and issues `UploadPart` calls concurrently. Storage returns an `ETag` (MD5 checksum) for each completed part.
3. **Complete**: Client transmits a `CompleteMultipartUpload` request containing the sorted list of `PartNumber` and corresponding `ETag` pairs. The storage engine stitches the chunks into a unified object.
4. **Abort**: Client or automated policy issues `AbortMultipartUpload` to clear orphaned chunks and reclaim storage.

### API & Payload Specification Matrix

| Protocol Step | HTTP Method & URI | Payload / Parameters | Server Response Data |
| :--- | :--- | :--- | :--- |
| **Initiate** | `POST /object-key?uploads` | Metadata headers | `<UploadId>18273645</UploadId>` |
| **Upload Part** | `PUT /object-key?partNumber=1&uploadId=18273645` | Raw Binary Chunk Data | `ETag: "a5b3c4d5..."` Header |
| **Complete** | `POST /object-key?uploadId=18273645` | XML/JSON list of PartNumbers & ETags | 200 OK `<CompleteMultipartUploadResult>` |
| **Abort** | `DELETE /object-key?uploadId=18273645` | Empty | 204 No Content |

### Key Resilience & Performance Advantages

- ✅ **Parallel Throughput**: Maximizes network bandwidth by uploading multiple chunks simultaneously.
- ✅ **Fault Resilience**: Network failure on a 5GB file only requires retrying the failed 10MB chunk, rather than restarting the entire file.
- ✅ **Pause and Resume**: Uploads can be paused across network drops or client restarts by persisting completed part ETag lists.

### Trade-offs & Production Considerations

- ❌ **Orphaned Chunk Storage Costs**: Incomplete uploads consume storage space. Systems must configure lifecycle rules to abort uncompleted uploads after 7 days.
- ❌ **Minimum Part Size**: S3 requires parts to be at least 5MB (except for the last part); uploading smaller chunks results in API errors.

### Key takeaway

Multipart upload enables **high-speed, fault-tolerant ingestion of large assets** by uploading independent chunks concurrently and assembling them atomically upon completion.
