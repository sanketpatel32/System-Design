# Synchronous vs Asynchronous Communication

> **Category:** Message Queues and Event Streaming

---

Communication between microservices and system components occurs via **Synchronous** or **Asynchronous** interaction models. Synchronous communication blocks the caller until a response is received, while asynchronous communication decouples the request execution from the caller, allowing the client to continue processing immediately.

### Communication models architecture

```
Synchronous Communication (Blocking REST / gRPC)
Client -------------- Request --------------> Service A
Client <------------- Response ------------- Service A  (Blocks for duration T)

Asynchronous Communication (Non-Blocking Message Queue)
Producer ---- Publish Event ----> [ Message Queue ]
                                         |
                                         v (Async Consume)
                                     Consumer
```

### Protocol comparison & characteristics

1. **Synchronous Protocols (REST, gRPC, HTTP/2)**: The client initiates a TCP connection and waits for the server to process the request and return an HTTP/gRPC status code and response body.
2. **Asynchronous Patterns (Message Brokers, Event Streams, Webhooks)**: The publisher pushes a message to an intermediary message broker (RabbitMQ, Apache Kafka, AWS SQS) and immediately receives an acknowledgment. Consumers process messages independently.

### Synchronous vs Asynchronous Matrix

| Dimension | Synchronous Communication | Asynchronous Communication |
| :--- | :--- | :--- |
| **Coupling** | Tight coupling (Caller must know receiver endpoint) | Loose coupling (Publisher knows only the topic/queue) |
| **Availability Dependency**| Low availability (Failure in downstream service cascades) | High availability (Broker buffers messages if consumer is down)|
| **Latency Profile** | Cumulative sum of downstream service call latencies | Immediate response (Sub-millisecond broker publish ACK) |
| **Complexity** | Low (Simple request-response programming model) | Higher (Requires managing brokers, retries, idempotency) |
| **Primary Use Cases** | User authentication, real-time queries, payment gateway API | Background processing, order fulfillment, logs, notifications |

### Key takeaway

Use synchronous communication (REST/gRPC) when immediate response data is required by the caller. Use asynchronous communication (message queues/streams) to decouple services, absorb traffic spikes, and improve system availability.
