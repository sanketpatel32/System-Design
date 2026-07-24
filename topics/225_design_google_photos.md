# Design Google Photos
> **Category:** Intermediate System Design Problems

---

### Overview
**Google Photos** is a media backup and management system featuring automatic background synchronization, AI-driven facial recognition, semantic image search, and intelligent storage compression.

### System Architecture Pipeline

```
+---------------+     1. Background Photo Sync     +-------------------+
| Mobile Device | -------------------------------> | Ingestion Service |
+---------------+                                  +-------------------+
                                                             |
                                                             v 2. Store Raw Image
                                                   +-------------------+
                                                   | Object Storage    |
                                                   | (AWS S3 / Google) |
                                                   +-------------------+
                                                             |
                                                             v 3. Async Event Trigger
                                                   +-------------------+
                                                   | AI Computer Vision| (TensorFlow Workers)
                                                   | Pipeline          |
                                                   +-------------------+
                                                             |
                                                             v 4. Index Embeddings & Face Clusters
                                                   +-------------------+
                                                   | Vector DB &       |
                                                   | Elasticsearch     |
                                                   +-------------------+
```

### Computer Vision & Indexing Features

| Feature | AI Model / Strategy |
|---|---|
| **Face Grouping** | Generates face embedding vectors; clusters embeddings using $k$-NN in Vector DB. |
| **Semantic Search** | Text-to-image semantic indexing using **CLIP / Vision Transformers** (e.g., search "sunset at beach"). |
| **Storage Saver** | Re-encodes images into high-efficiency **WebP / AVIF** codecs with imperceptible perceptual quality loss. |

### Vector Index Schema (Milvus / Qdrant)
```json
{
  "photo_id": "p_99812",
  "user_id": "usr_441",
  "face_embeddings": [
    [0.12, -0.44, 0.88, "... (512-dim vector)"]
  ],
  "image_concept_tags": ["beach", "sunset", "ocean", "dog"],
  "location": { "lat": 37.7749, "lon": -122.4194 }
}
```

### Key takeaway
Google Photos combines scalable **object storage** for photo asset retention with asynchronous **Vector DB AI pipelines** to enable semantic natural language photo search and automated face clustering.
