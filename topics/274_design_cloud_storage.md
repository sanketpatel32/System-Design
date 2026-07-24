# Design Cloud Storage

> **Category:** Advanced System Design Problems

---

A Cloud Object Storage System (e.g. AWS S3, Google Cloud Storage) stores unstructured binary objects (files, images, backups) across distributed hardware with high durability and availability.

### System Requirements
- **Functional Requirements**:
  - `PUT`, `GET`, `DELETE`, and `LIST` objects within bucket namespaces.
  - Support multipart file uploads and object versioning.
  - Configurable storage lifecycle policies (Hot, Warm, Cold/Archival).
- **Non-Functional Requirements**:
  - Extreme Durability: $99.999999999\%$ (11 9s) durability using Erasure Coding.
  - High Availability: $99.99\%$ availability across multi-AZ data centers.
  - Infinite Horizontal Scale: Store exabytes of data across millions of drives.

### System Architecture
```
[ Client ] ---> [ API Gateway / Frontend ] ---> [ Metadata Engine (Spanner/DynamoDB) ]
                                                         |
                         +-------------------------------+-------------------------------+
                         |                                                               |
                         v                                                               v
            [ Storage Node Block Manager ]                                 [ Reed-Solomon Erasure Coder ]
            (Data Chunks + Parity Chunks)                                  (e.g., 8 Data + 4 Parity)
                         |                                                               |
                         +-------------------------------+-------------------------------+
                                                         |
                                                         v
                                           [ Disk Storage Cluster (Hard Drives) ]
```

### Durability Strategies (3x Replication vs Erasure Coding)
| Strategy | Implementation | Storage Overhead | Durability Guarantee |
|---|---|---|---|
| **3x Replication** | Writes 3 complete copies across different AZs | $200\%$ overhead ($3.0	imes$ multiplier) | High; expensive storage cost for massive scale. |
| **Erasure Coding (8+4)** | Splits object into 8 data blocks + 4 parity blocks; recovers from any 8 blocks | $50\%$ overhead ($1.5	imes$ multiplier) | Extreme durability (survives 4 simultaneous drive/node losses). |

### Key takeaway
Cloud object storage systems decouple metadata lookup from chunk storage nodes, relying on Reed-Solomon Erasure Coding ($8+4$) to achieve 11 9s of durability with minimal storage overhead.
