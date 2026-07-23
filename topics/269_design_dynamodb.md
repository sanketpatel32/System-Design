# Design DynamoDB

> **Category:** Advanced System Design Problems

---

See **#268 Design Distributed Key-Value Store** for the Dynamo paper design.

### DynamoDB-specific (AWS managed)
- **Tables**: name + schema (PK + optional SK).
- **Partitions**: by PK hash.
- **Indexes**: LSI (local), GSI (global).
- **Streams**: CDC events.
- **TTL**: auto-expire items.
- **DAX**: in-memory cache.

### Capacity
- **Provisioned**: RCU/WCU per table.
- **On-demand**: pay per request.

### Consistency
- **Eventually consistent** reads (default, 2x cheaper).
- **Strongly consistent** reads (read from leader).

### Global tables
- Multi-region active-active.
- Replication + conflict resolution.

### Key takeaway
DynamoDB = Dynamo-paper design + managed service + GSIs/LSIs + streams + global tables. Pick
partition key for even distribution. Use GSIs for alternate access patterns.
