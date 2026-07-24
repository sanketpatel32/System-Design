# CQRS

> **Category:** Distributed Systems

---

CQRS (Command Query Responsibility Segregation) is an architectural pattern that **decouples read operations (Queries) from write operations (Commands)** into separate data models and storage engines. This isolation allows systems to optimize write throughput and read performance independently.

### CQRS System Architecture

Writes execute against a normalized Command Database, emitting CDC events to update an un-normalized, highly indexed Query Database.

```
                                  +-----------------------+
                                  |   Client Application  |
                                  +-----------------------+
                                     /                                      1. Issue Command                   2. Issue Query
                     `CreateOrder()`                    `GetOrderDetails()`
                                   /                                                       v                       v
      +---------------------------------------+       +---------------------------------------+
      | Command Service (Write API)           |       | Query Service (Read API)              |
      | - Validates business rules            |       | - Fast JSON projections               |
      | - Writes to Write DB (Normalized SQL) |       | - Queries Read DB (Elastic/Redis)     |
      +---------------------------------------+       +---------------------------------------+
                          |                                       ^
               3. Publish Event (`OrderCreated`)                  | 4. Update Read Model
                          v                                       |    Projections
      +---------------------------------------------------------------------------------------+
      | Message Broker / Event Bus (Kafka / RabbitMQ / Debezium CDC)                          |
      +---------------------------------------------------------------------------------------+
```

### Command Side vs Query Side Comparison Matrix

| Dimension | Command Model (Write Side) | Query Model (Read Side) |
| :--- | :--- | :--- |
| **Primary Focus** | Business logic enforcement, transactional integrity | Ultra-fast data retrieval and screen rendering |
| **Data Schema** | Highly normalized (3NF) relational tables | Denormalized flat JSON, Elastic documents, Redis KV |
| **Data Mutability**| Mutates state via transactional `INSERT`/`UPDATE` | Read-only view projections |
| **Consistency** | Strong ACID consistency | Eventual consistency (Asynchronous sync lag) |
| **Scaling Strategy**| Scaled vertically or sharded by Entity ID | Scaled horizontally via read replicas / caches |

### Synchronizing Command and Query Stores

1. **Async Event-Driven Projection**: When the Command model updates, an event (`OrderUpdated`) is published to Kafka. Projection workers consume events and update Elasticsearch/MongoDB read models.
2. **Change Data Capture (CDC)**: Tools like Debezium capture database WAL updates directly from PostgreSQL/MySQL and update read stores without application code hooks.

### Key Trade-offs & System Design Guidelines

- ✅ **Independent Scalability**: Read replicas can scale 100x relative to write instances for read-heavy workloads.
- ✅ **Optimized Data Schemas**: Eliminates complex SQL multi-table joins on query paths.
- ❌ **Eventual Consistency Lag**: Users may experience a slight delay between submitting a command and seeing the updated data in query views.
### Production CQRS Code Structure Example

```python
# Command Model (Handles Business Rules & Writes to RDBMS)
class CreateOrderCommand:
    def execute(self, user_id, item_id, quantity):
        order = Order.create(user_id, item_id, quantity)
        db_session.save(order)
        event_bus.publish(OrderCreatedEvent(order.id, user_id, item_id))
        return order.id

# Query Model (Queries Denormalized Elasticsearch Index)
class GetUserOrdersQuery:
    def execute(self, user_id):
        # Direct fast JSON query without SQL joins!
        return elasticsearch_client.search(
            index="user_order_views",
            body={"query": {"term": {"user_id": user_id}}}
        )
```

### Key takeaway

CQRS optimizes high-scale applications by **separating command write pipelines from denormalized query read models**, synchronizing them asynchronously via event streams.
