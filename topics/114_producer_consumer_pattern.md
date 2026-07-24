# Producer-Consumer Pattern

> **Category:** Message Queues and Event Streaming

---

The **Producer-Consumer Pattern** is a foundational concurrency and architecture pattern that decouples task submission (**Producers**) from task execution (**Consumers**) using a shared buffer or message queue.

### Architectural layout

```
 +---------------+                                                      +---------------+
 |  Producer 1   | --+                                               +->|  Consumer 1   |
 +---------------+   |                                               |  +---------------+
                     |     +-----------------------------------+     |
 +---------------+   +---> |    SHARED BOUNDED QUEUE / BUFFER | ----+->|  Consumer 2   |
 |  Producer 2   | ------> | [Task 1] [Task 2] [Task 3] [Task 4|     |  +---------------+
 +---------------+   |     +-----------------------------------+     |
                     |                                               +->|  Consumer 3   |
 +---------------+   |                                                  +---------------+
 |  Producer N   | --+                                                  (Worker Pool)
 +---------------+
```

### Core mechanics

1. **Decoupled Rates**: Producers generate tasks at variable rates without blocking on consumer processing speed. Consumers pull and process tasks at their optimal capacity.
2. **Flow Control & Backpressure**: The bounded buffer prevents fast producers from overwhelming slow consumers. If the buffer is full, producers block or receive backpressure signals until space opens.
3. **Thread / Process Safety**: The shared queue uses mutexes, semaphores, or atomic ring buffers to ensure concurrent safety across multiple producer and consumer threads.

### Concurrency Implementation Comparison

| Scope | Queue Implementation Tech | Primary Mechanics | Use Case |
| :--- | :--- | :--- | :--- |
| **In-Memory Thread Pool** | `ArrayBlockingQueue`, `Channel` (Go) | Mutex locks, condition variables, channels | Concurrent task execution within a single app process |
| **Distributed Microservice**| RabbitMQ, AWS SQS, Apache Kafka | Network TCP broker, persistent storage, ACK protocol| Asynchronous job processing across microservices |

### Key takeaway

The Producer-Consumer pattern decouples work generation from execution. Use bounded queues to manage concurrency, absorb traffic bursts, and enforce backpressure between producers and consumers.
