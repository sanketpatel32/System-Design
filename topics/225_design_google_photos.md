# Design Google Photos

> **Category:** Intermediate System Design Problems

---

Design Google Photos: store, organize, search photos/videos.

### Requirements
- **Functional**: auto-upload; search (objects, faces); albums; sharing.
- **Non-functional**: massive storage; fast search.

### Architecture
```
[Phone] -> auto-upload -> [API] -> [S3 (originals)]
                                    |
                                    v
                              [Image processor]
                                (thumbnails, ML tags, face detection)
                                    |
                                    v
                              [Search index (ES)]
                              [Metadata DB]
```

### Auto-upload
- Background sync from phone.
- Dedup by hash.

### Search
- ML model tags each photo (objects, scenes, faces).
- Search by tag: "beach", "dog", "mom".

### Storage tiers
- Hot: recent photos (SSN).
- Cold: > 1 year (Glacier).

### Thumbnails
- Multiple sizes per photo.
- CDN for fast gallery loading.

### Key takeaway
Google Photos = auto-upload + ML tagging + search index + tiered storage. Thumbnails for
galleries, originals on demand. Storage cost managed via tiering.
