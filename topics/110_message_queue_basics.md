# Message Queue Basics

> **Category:** Message Queues and Event Streaming

---

A **Message Queue** is an asynchronous communication component used to buffer, route, and deliver messages between producer and consumer applications. Message queues decouple application components in space (services don't need to know each other's physical network locations) and time (producers and consumers don't need to be online concurrently).

### Message queue topology

```
+---------------+                      +------------------+                      +---------------+
|  Producer A   | ---- Publish ------->|                  | ---- Acknowledge --->|  Consumer A   |
+---------------+                      |  MESSAGE QUEUE   |                      +---------------+
                                       |  (FIFO Buffer)   |
+---------------+                      |                  |                      +---------------+
|  Producer B   | ---- Publish ------->|                  | ---- Acknowledge --->|  Consumer B   |
+---------------+                      +------------------+                      +---------------+
```

### Core components & terminology

1. **Producer**: Application that constructs and sends message payloads to the queue.
2. **Queue**: FIFO (First-In, First-Out) memory/disk buffer that stores messages until consumed.
3. **Consumer**: Worker application that polls or receives messages from the queue, processes them, and sends back an acknowledgment (ACK).
4. **Acknowledgment (ACK / NACK)**: Signal sent by a consumer informing the broker that a message has been processed successfully (ACK) or failed (NACK), allowing the queue to delete or re-queue the message.

### Message Queue Capabilities Matrix

| Architectural Benefit | Mechanism | Impact |
| :--- | :--- | :--- |
| **Temporal Decoupling** | Broker buffers messages on disk/RAM | Consumers can be offline during producer traffic spikes |
| **Load Leveling (Spike Absorbing)**| Queue buffers incoming burst requests | Consumers process messages at a steady, controlled rate |
| **Fault Tolerance** | Unacknowledged messages are re-routed | Service crashes do not result in data loss |
| **Horizontal Scalability** | Add consumers to a worker pool | Distributes message processing across consumer instances |

### Key takeaway

Message queues enable asynchronous communication and temporal decoupling. Use message queues to buffer high-volume bursts, prevent cascading service failures, and distribute worker execution across consumer pools.
