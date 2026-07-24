# Design Google Photos
> **Category:** Intermediate System Design Problems

---

### Overview
**Google Photos** is a cloud photo and video storage, sharing, and intelligent search service managing hundreds of petabytes of user media.

The system features automatic background camera backup, **AI Vector Embedding Search** (searching photos by facial recognition, objects, or locations without user manual tagging), dynamic image compression, and duplicate detection.

### System Architecture & AI Vector Search Topology

```
+------------------+     1. Direct Media Upload         +--------------------+
| Google Photos    | ---------------------------------> | S3 / Colossus Media|
| Mobile App       |                                    | Storage            |
+------------------+                                    +--------------------+
                                                                  |
                                                                  | 2. New Photo Event
                                                                  v
+------------------+     5. Semantic Search Query       +--------------------+
| Search API       | <--------------------------------- | Computer Vision ML |
| Engine           |                                    | Vector Indexer     |
+------------------+                                    +--------------------+
         |                                                        |
         | 6. Nearest Neighbor Vector Search                      | 3. Extract Feature Vector (512-dim)
         v                                                        v
+--------------------------------------------------------------------------+
| VECTOR DATABASE (Milvus / ScaNN Vector Store)                            |
| Stores Face & Object Embeddings for Visual Similarity Search             |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Computer Vision Vector Indexing:** Every uploaded photo is processed through a Convolutional Neural Network (CNN / Vision Transformer) to extract a 512-dimensional vector embedding representing visual features (faces, dogs, beaches, text).
2. **Approximate Nearest Neighbor (ANN) Search:** Searches photos using vector similarity algorithms (ScaNN / HNSW) in a Vector DB. Querying *"dogs at the beach"* compares the query vector against the user's photo embeddings in milliseconds.
3. **Perceptual Hashing (pHash) Deduplication:** Computes perceptual image hashes to detect and group identical or near-identical photos (e.g., burst mode shots) to save storage.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/photos/search` | GET | `{"query": "sunset in Hawaii", "user_id": "u_99"}` | `{"photos": [{"id": "p_881", "thumbnail_url": "https://...", "confidence": 0.94}]}` |
| `/api/v1/photos/people` | GET | `{"user_id": "u_99"}` | `{"clusters": [{"person_id": "face_12", "face_url": "...", "photo_count": 420}]}` |

### Photos Metadata & Vector Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `photo_id` | UUID | Spanner / Bigtable | Unique Primary Key for photo record. |
| `user_id` | String (Indexed) | Spanner DB | Owner user account ID. |
| `embedding_vector` | Array of Floats (512d) | ScaNN / Milvus Vector DB| Deep learning feature vector representing visual content. |
| `phash` | String | Spanner DB | Perceptual hash string used for duplicate detection. |
| `exif_geo` | Point (Lat, Long) | Spanner DB | Geographic coordinates extracted from EXIF metadata. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Vector Embedding Search (ScaNN)** | Enables natural language visual search ("golden retriever") without manual user tags. | High GPU inference and vector database indexing cost per photo. | AI-powered media library platforms. |
| **High Quality Compression Option**| Saves up to 50% storage space with minimal human-perceivable visual quality loss. | Re-encoding photos consumes background cloud CPU resources. | Consumer cloud photo backup platforms. |
| **Perceptual Hashing (pHash)** | Detects duplicate photos even if resized, re-saved, or slightly cropped. | Does not distinguish between intentional burst shots and accidental duplicates. | Media deduplication engines. |

### Key takeaway
**Google Photos** powers intelligent media search by extracting **512-dimensional Computer Vision Vector Embeddings** per photo, indexing them in **Vector Databases (ScaNN)** for instant natural language and facial recognition retrieval.
