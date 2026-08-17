# GraphQL

> **Category:** Networking Basics

---

**GraphQL** is an open-source data query and manipulation language for APIs, developed by Facebook. Unlike REST APIs which use multiple endpoints returning fixed data structures, GraphQL provides a **single POST endpoint** (`/graphql`) allowing clients to request precisely the fields they need.

### GraphQL Query Resolution Topology

```
+-------------------------------------------------------------------------+
|                      GRAPHQL QUERY RESOLUTION FLOW                      |
+-------------------------------------------------------------------------+

  [ Mobile Client ]
         |
         |  1. POST /graphql Payload: query { user(id:42) { name, email } }
         v
  +-----------------------------------------------------------------------+
  | GRAPHQL ENGINE (Schema Definition & AST Parser)                      |
  +-----------------------------------------------------------------------+
         |                                         |
         v (Resolver: User DB)                     v (Resolver: Order Svc)
  [ User Database ]                         [ Order Microservice ]
         |                                         |
         +--------------------+--------------------+
                              |
                              v  2. Response: Exact requested JSON
  [ Client Application ]  {"data": {"user": {"name": "Alice", "email": "a@x.com"}}}
```

### GraphQL vs REST Comparison Matrix

| Feature | GraphQL | REST API |
| :--- | :--- | :--- |
| **Endpoint Topology** | Single HTTP POST endpoint (`/graphql`) | Multiple resource endpoints (`/users`, `/orders`) |
| **Data Fetching** | Client specifies exact JSON response shape | Fixed payload schema determined by server |
| **Over/Under-Fetching**| Fully eliminated | Common (Over-fetching extra fields, under-fetching requires N+1 requests) |
| **Type System** | Strongly typed GraphQL Schema (SDL) | Optional OpenAPI specification |
| **Caching Layer** | Complex (Requires client Normalized Cache / Relay)| Simple HTTP response caching via CDNs & standard HTTP headers |
| **Performance Overhead**| Higher server CPU overhead (AST parsing & Resolver execution) | Low (Direct routing and serialization) |

### Solved & Unsolved Challenges in GraphQL

- **N+1 Query Problem**: Occurs when a parent resolver executes 1 DB query and child resolvers execute N separate sub-queries. *Solution*: DataLoader batching and caching utility.
- **Query Complexity Abuse**: Malicious clients can submit infinitely nested queries (e.g., `user { friends { friends { friends } } }`). *Solution*: Enforce query depth limits and query cost analysis.

### Key takeaway

GraphQL solves **over-fetching and under-fetching** by letting clients query exact JSON structures from a single endpoint. Use **DataLoader** to prevent N+1 database query bottlenecks and set **query depth limits** for security.
