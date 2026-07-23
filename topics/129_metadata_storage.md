# Metadata Storage

> **Category:** Storage Systems

---

Metadata storage = **a separate store for descriptive data about objects** (size, type,
owner, tags), distinct from the object data itself.

### Why separate
- Object stores (S3) hold the data; metadata in S3 is limited.
- For rich queries (find all images from user X in date range), you need a **searchable** store.

### Typical pattern
```
[User uploads photo]
    |
    v
1. Store photo bytes in S3: s3://photos/abc.jpg
2. Store metadata in Postgres / DynamoDB / ES:
   {
     id: "abc",
     user_id: 123,
     s3_key: "photos/abc.jpg",
     size: 200KB,
     type: "image/jpeg",
     created_at: "2024-06-01T...",
     tags: ["vacation", "beach"]
   }
```

### Where to store metadata
- **Postgres / MySQL** — structured, queryable, transactional.
- **DynamoDB** — key-value at scale.
- **Elasticsearch** — full-text / faceted search.
- **MongoDB** — flexible schema.

### Use cases
- **Photo/video apps**: file in S3, metadata in DB.
- **CMS**: document in S3, search via metadata.
- **E-commerce**: product image in S3, product info in DB.

### Benefits
- **Fast queries** (filter, sort, paginate metadata without scanning blobs).
- **Search** across attributes.
- **Transactional updates** (rename = metadata change, not file move).

### Pitfalls
- **Consistency**: S3 upload + metadata insert must both succeed (transactional outbox).
- **Sync drift**: metadata may not match actual blob (cleanup jobs).

### Key takeaway
Keep **objects in S3, metadata in a database**. S3 holds bytes; DB holds searchable attributes.
This split enables fast queries, search, and transactions that S3 alone can't provide.
