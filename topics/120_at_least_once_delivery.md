# At-Least-Once Delivery

> **Category:** Message Queues and Event Streaming

---

**At-Least-Once Delivery** is a message delivery guarantee where a message broker guarantees that a message will be delivered to a consumer one or more times. Under this guarantee, no messages are lost, but consumers may receive duplicate deliveries due to network retries, timeouts, or consumer crashes.

### Duplicate delivery scenario

```
 [Producer] -------- Publish Msg --------> [Message Broker] -------- Deliver Msg --------> [Consumer Node]
                                                ^                                                |
                                                |                                                v
                                            No ACK Received                             [Process Payment]
                                         (Network Timeout)                                       |
                                                |                                                v
 [Producer] <--- Duplicate Redelivery ----------+ <--- ACK Lost over Network --- [Crash / Timeout]
```

### Mechanics & failure scenarios

1. **Consumer Acknowledgment Flow**: The broker holds a message until the consumer processes it and sends back an ACK.
2. **Duplicate Trigger**: If the consumer processes the message but crashes, experiences a GC pause, or loses network connectivity before sending the ACK back, the broker's visibility timeout expires and it redelivers the message to another consumer instance.

### Delivery Guarantees Spectrum

| Delivery Guarantee | Message Loss Risk | Duplicate Risk | System Overhead / Complexity |
| :--- | :--- | :--- | :--- |
| **At-Most-Once** | High (Messages dropped if worker fails) | Zero | Low (Fire-and-forget; no ACKs) |
| **At-Least-Once** | Zero | Moderate to High | Moderate (Default model for Kafka/SQS/RabbitMQ) |
| **Exactly-Once** | Zero | Zero | High (Requires 2PC / distributed transactions) |

### Designing for At-Least-Once Delivery

Because At-Least-Once delivery is the default operational mode for robust message brokers (AWS SQS, Apache Kafka, RabbitMQ), application developers **must build idempotent consumers** to handle duplicate deliveries gracefully without causing inconsistent state.

### Key takeaway

At-Least-Once delivery guarantees no message loss by retrying unacknowledged messages, but may deliver duplicates. Pair At-Least-Once delivery brokers with idempotent consumers to achieve effectively exactly-once processing semantics.
