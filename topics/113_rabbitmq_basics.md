# RabbitMQ Basics

> **Category:** Message Queues and Event Streaming

---

**RabbitMQ** is an open-source message broker that implements the Advanced Message Queuing Protocol (AMQP 0-9-1). RabbitMQ excels at complex message routing, flexible queuing topologies, and fine-grained per-message acknowledgment handling.

### AMQP architecture

```
  +--------------+                    +-------------------------+
  |  Producer    | ---- Publish ----> |    EXCHANGE             |
  +--------------+                    | (Direct/Fanout/Topic)   |
                                      +-------------------------+
                                           /                 \
                                  Binding Key A          Binding Key B
                                         v                     v
                                  +------------+         +------------+
                                  | Queue A    |         | Queue B    |
                                  +------------+         +------------+
                                        |                      |
                                        v                      v
                                  +------------+         +------------+
                                  | Consumer A |         | Consumer B |
                                  +------------+         +------------+
```

### Core components & exchange types

1. **Exchange**: Receives messages from producers and routes them to queues based on routing keys and exchange types:
   - **Direct Exchange**: Routes messages based on an exact match between routing key and queue binding key.
   - **Fanout Exchange**: Broadcasts messages to all bound queues, ignoring routing keys (Pub-Sub pattern).
   - **Topic Exchange**: Performs wildcard pattern matching between routing keys and binding patterns (e.g., `orders.*.europe`).
   - **Headers Exchange**: Routes messages based on message header attributes.
2. **Queue**: Buffer that stores messages until consumed.
3. **Bindings**: Rules linking exchanges to queues.

### RabbitMQ vs Kafka Comparison

| Feature | RabbitMQ | Apache Kafka |
| :--- | :--- | :--- |
| **Routing Flexibility** | Extremely High (Complex exchanges & routing keys)| Basic (Partition key hashing) |
| **Message Consumption** | Push-based broker model | Pull-based consumer model |
| **State Tracking** | Broker tracks queue state and message ACK | Consumer tracks offset pointers |
| **Best Used For** | Complex routing, low-latency RPC, task queues | Event streaming, log aggregation, event sourcing |

### Key takeaway

RabbitMQ provides flexible message routing and fine-grained queue management via AMQP exchanges. Use RabbitMQ for complex messaging topologies, low-latency task delegation, and per-message routing rules.
