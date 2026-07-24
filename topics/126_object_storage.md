# Object Storage

> **Category:** Storage Systems

---

Object storage manages data as **discrete objects in a flat namespace**, combining raw data payloads, customizable metadata, and a unique global key. Data is accessed via HTTP REST APIs.

### System Architecture

Object storage decouples metadata management from data storage nodes. Data is split into chunks, protected with erasure coding, and replicated across storage racks.

```
+-----------------------------------------------------------------------------------+
|                             Client / Web Application                              |
+-----------------------------------------------------------------------------------+
                                          | HTTP REST (GET / PUT / DELETE)
                                          v
+-----------------------------------------------------------------------------------+
|                            API Gateway / Load Balancer                            |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
    +-----------------------+                           +-----------------------+
    | Metadata Service DB   |                           | Storage Nodes (Data)  |
    | (Key -> Chunk Mapping)|                           | Erasure-Coded Chunks  |
    +-----------------------+                           +-----------------------+
```

### Core Abstractions

- **Bucket**: Top-level container acting as a namespace (e.g., `my-app-media`).
- **Key**: Unique string identifier representing the object path (e.g., `images/2026/user_101.jpg`).
- **Object**: Immutable binary payload plus HTTP headers and user metadata.

### Object Storage API Matrix

| Operation | HTTP Method | Request Payload | Response / Consistency |
| :--- | :--- | :--- | :--- |
| **PutObject** | `PUT /bucket/key` | Binary Payload + Metadata | Strong consistency (S3/GCS) |
| **GetObject** | `GET /bucket/key` | None | 200 OK + Payload Stream |
| **DeleteObject**| `DELETE /bucket/key`| None | 204 No Content |
| **ListObjects** | `GET /bucket?prefix=p`| Query Params | XML/JSON Object Index List |

### Key Trade-offs & Capabilities

- ✅ **Infinite Horizontal Scale**: Flat architecture allows scaling to exabytes across distributed commodity hardware.
- ✅ **Cost-Effective**: Highly efficient erasure coding reduces storage overhead compared to 3x replication.
- ❌ **Immutability Constraint**: Objects cannot be modified in-place; updating 1 byte requires rewriting the entire object.
- ❌ **Higher Initial Latency**: REST API overhead leads to 10–50 ms response times compared to block storage.

### Key takeaway

Object storage offers **massive scale, high durability, and low cost** for immutable unstructured data accessed over HTTP REST APIs.
