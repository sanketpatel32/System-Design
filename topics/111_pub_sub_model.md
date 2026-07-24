# Pub-Sub Model

> **Category:** Message Queues and Event Streaming

---

The **Publish-Subscribe (Pub-Sub)** pattern is a messaging architecture where publishers broadcast events to a central topic without knowledge of which subscribers exist. Subscribers express interest in specific topics and receive a copy of all published messages asynchronously.

### Pub-Sub architecture

```
                            +--------------------+
                            |    Publisher A     |
                            +--------------------+
                                      |
                                Publish Event
                                      v
                            +--------------------+
                            |  TOPIC: "Orders"   |
                            +--------------------+
                               /      |       \
                     +--------+   +---+---+    +--------+
                     |            |            |        |
                     v            v            v        v
              +------------+ +------------+ +------------+
              | Sub: Inventory| Sub: Payment | Sub: Shipping|
              +------------+ +------------+ +------------+
```

### Point-to-Point Queue vs Pub-Sub Model

1. **Point-to-Point (Competing Consumers)**: Each message in the queue is processed by **exactly one** consumer in the pool. Once processed and acknowledged, the message is deleted.
2. **Pub-Sub (One-to-Many Fanout)**: Every subscriber bound to a topic receives its **own independent copy** of the published event, allowing multiple downstream microservices to process the same trigger independently.

### Messaging Pattern Comparison

| Feature | Point-to-Point Queue (e.g., SQS) | Pub-Sub Model (e.g., SNS, Kafka Topic) |
| :--- | :--- | :--- |
| **Consumer Relationship** | Competing consumers (One consumer gets message) | Fanout subscribers (All subscribers get message) |
| **Message Lifetime** | Deleted once acknowledged by a worker | Retained until all subscribers read or TTL expires |
| **Use Cases** | Task delegation, background job processing | Event-driven microservice notifications, analytics |
| **Adding New Consumers** | Increases parallel worker processing capacity | Introduces new functionality without altering publisher code |

### Key takeaway

The Pub-Sub model enables one-to-many event broadcasting. Use Pub-Sub to decouple publishers from subscribers, allowing new microservices to consume existing event streams without altering publisher logic.
