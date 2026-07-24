# High Level Design vs Low Level Design

> **Category:** System Design Basics

---

Software architecture is divided into two interdependent design phases: **High-Level Design (HLD)** and **Low-Level Design (LLD)**. HLD defines the macro-architecture—how independent services and infrastructure communicate—while LLD details the micro-architecture—how individual classes, methods, and modules execute logic inside a single service.

### Structural Comparison

```
+-------------------------------------------------------------------------+
|                        HIGH-LEVEL DESIGN (HLD)                          |
|  [ Client ] ---> [ API Gateway ] ---> [ Load Balancer ]                |
|                                             |                           |
|                    +------------------------+------------------------+  |
|                    |                                                 |  |
|                    v                                                 v  |
|          [ User Service ]                                [ Order Service ] |
|            |           |                                       |        |
|            v           v                                       v        |
|        [Redis]    [PostgreSQL]                             [Kafka]      |
+-------------------------------------------------------------------------+
                                    |
                                    | Zooms into Service Internals
                                    v
+-------------------------------------------------------------------------+
|                        LOW-LEVEL DESIGN (LLD)                           |
|  +-------------------------------------------------------------------+  |
|  | OrderService (Class)                                              |  |
|  | - paymentGateway: PaymentProvider                                 |  |
|  | - repo: OrderRepository                                           |  |
|  | + processOrder(OrderDTO dto): OrderResult                         |  |
|  +-------------------------------------------------------------------+  |
|                                   | (Strategy Pattern)                  |
|          +------------------------+------------------------+            |
|          v                                                 v            |
|  +-----------------------+                         +------------------+ |
|  | CreditCardPayment     |                         | CryptoPayment    | |
|  +-----------------------+                         +------------------+ |
+-------------------------------------------------------------------------+
```

### Architectural Feature Breakdown

| Feature | High-Level Design (HLD) | Low-Level Design (LLD) |
| :--- | :--- | :--- |
| **Primary Scope** | Multi-service interactions, data flow, infrastructure topology | Single component logic, OOP structure, design patterns |
| **Key Deliverables** | Service blueprints, data flow diagrams, network topologies | Class diagrams, sequence diagrams, interface schemas, SQL DDL |
| **System Concerns** | Scalability, availability, latency, fault tolerance, security | Code reuse, maintainability, extensibility, thread safety |
| **Data Abstraction** | Distributed databases, cache clusters, message queues | In-memory data structures (HashMaps, Trees), DTOs, Entities |
| **Common Patterns** | Microservices, Event-Driven, CQRS, Saga Pattern | Factory, Strategy, Observer, Decorator, Dependency Injection |
| **Failure Domains** | Network partition, node outage, DB connection exhaustion | Null pointer exceptions, race conditions, memory leaks |

### High-Level Design Artifacts
HLD focuses on system components and communication mechanisms:
- **Topology Diagrams**: Displaying CDNs, Load Balancers, API Gateways, App Servers, and Storage Nodes.
- **Data Movement & Protocol Specifications**: Choosing gRPC over HTTP/2, WebSocket for bi-directional streaming, or Kafka for asynchronous messaging.
- **Database Selection**: Deciding between Relational DBs (ACID transactions) vs. NoSQL (Eventual consistency, high write throughput).

### Low-Level Design Artifacts
LLD translates service interfaces into structured, extensible code artifacts:
- **Class and Interface Hierarchies**: Adhering to SOLID principles (Single Responsibility, Open-Closed, etc.).
- **Concurrency & State Control**: Thread-safe locks, atomic operations, connection pool configurations, and memory management.
- **API and Schema Contracts**: JSON/Protobuf pay-load definitions, field validations, and error code structures.

### Key takeaway

High-Level Design creates the **blueprint for system scalability and infrastructure resilience**, while Low-Level Design creates the **blueprint for code maintainability and execution efficiency**. A successful system requires seamless alignment between macro architectural patterns and micro software design.
