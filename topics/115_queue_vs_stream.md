# Queue vs Stream

> **Category:** Message Queues and Event Streaming

---

Understanding the differences between **Message Queues** (e.g., RabbitMQ, AWS SQS) and **Event Streams** (e.g., Apache Kafka, AWS Kinesis) is essential for designing event-driven systems. Message queues focus on ephemeral task distribution, while event streams focus on ordered, append-only event log persistence.

### Architectural comparison

```
 Message Queue Model (Ephemeral Task Delegation)
 Producer ---> [ Message Queue ] ---> Consumer A (Processes & Destroys Message)

 Event Stream Model (Immutable Replay Log)
 Producer ---> [ Partition Log: 0, 1, 2, 3... ] ---> Consumer Group 1 (Offset: 2)
                                              ---> Consumer Group 2 (Offset: 0 - Replay)
```

### Core Comparison Matrix

| Architectural Feature | Message Queue (SQS / RabbitMQ) | Event Stream (Kafka / Kinesis) |
| :--- | :--- | :--- |
| **Message Lifetime** | Ephemeral (Deleted immediately upon consumer ACK) | Persistent (Retained for fixed duration e.g., 7 days) |
| **State Tracking** | Managed by Broker | Managed by Consumer (Offset pointer) |
| **Consumer Model** | Competing Consumers (Each message handled once) | Multi-Group Pub-Sub (Each group gets all messages) |
| **Replayability** | Cannot replay deleted messages | Supports replaying historical events from any offset |
| **Ordering Guarantees**| Weak / Local queue ordering | Strict ordering within each stream partition |
| **Primary Use Cases** | Asynchronous task execution, email sending | Analytics pipelines, CDC, Event Sourcing, Audit logs |

### Key takeaway

Select Message Queues for transient task processing where individual messages are discarded after execution. Select Event Streams when data must be retained, replayed, strictly ordered by partition, or consumed by multiple independent systems.
