# Denormalization

> **Category:** Databases

---

Denormalization = **intentionally introducing redundancy** to speed up reads at the cost of
write complexity and storage.

### Why
- Normalized schemas need many joins → slow reads.
- Denormalize hot paths to avoid joins.

### Example: comments on a post
**Normalized**:
```
comments(id, post_id, user_id, body)
users(id, name, avatar)
```
Reading a comment's author = JOIN users.

**Denormalized**:
```
comments(id, post_id, user_id, user_name, user_avatar, body)
```
Reads are fast (one table). But:
- If user changes avatar → update every comment row (write amplification).
- More storage.

### Patterns
- **Duplicate hot columns**: store author_name alongside author_id.
- **Pre-aggregate**: store `comment_count` on posts instead of `COUNT(*)`.
- **Materialized view**: snapshot of a join, refreshed periodically.
- **CQRS**: separate read model from write model.

### When to denormalize
- Read-heavy workloads (100x more reads than writes).
- Joins become a bottleneck.
- Real-time dashboards.

### Risks
- **Update anomalies** — change in one place, must update many.
- **Consistency** — denormalized copies may drift.
- **Storage cost** — duplicate data.

### Mitigations
- **Background sync jobs** that keep copies consistent.
- **Triggers** that propagate updates (heavy).
- **Event-driven updates** (DB → Kafka → denormalizer).

### Key takeaway
Denormalize **hot read paths** when joins become the bottleneck. Accept write complexity and
storage cost. Always have a clear strategy for keeping denormalized data consistent.
