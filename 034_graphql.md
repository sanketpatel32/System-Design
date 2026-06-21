# GraphQL

> **Category:** Networking Basics

---

GraphQL = a **query language for APIs** where the client specifies exactly what fields it
needs in a single request. Developed by Facebook (2015).

### Core idea
Instead of multiple REST endpoints, **one endpoint** (`/graphql`) takes a query describing the
shape of the response.

```graphql
query {
  user(id: "123") {
    name
    email
    orders(last: 5) {
      total
      items { name price }
    }
  }
}
```
Returns exactly those fields, nothing more. One round trip instead of 5.

### Three operation types
- **Query** — read (like GET).
- **Mutation** — write (like POST/PUT/DELETE).
- **Subscription** — server pushes updates over WebSocket.

### Schema + resolvers
```graphql
type User {
  id: ID!
  name: String!
  orders: [Order!]!
}
```
Each field has a **resolver** function. GraphQL orchestrates fetching — you write per-field
logic.

### Pros
- **No over/under-fetching** — client controls payload shape.
- **Single endpoint** — simpler client routing.
- **Schema is the contract** — types, deprecations, introspection.
- **Aggregates** multiple services in one query (BFF pattern).

### Cons
- **N+1 problem** — resolvers firing per-row; fix with DataLoader batching.
- **Cache unfriendly** — single POST endpoint, no HTTP-level caching.
- **Auth/authorization** is per-field, not per-endpoint.
- **Complexity attacks** — client can request deeply nested data; need cost analysis.

### When to use GraphQL
- **Mobile / web** clients with many UI variants needing tailored data.
- **Aggregating** many microservices behind a BFF.
- Avoid for: simple CRUD, server-to-server (use gRPC), heavy file uploads.

### Key takeaway
GraphQL shines for **client-driven, aggregated reads** (mobile apps, dashboards). Cost: caching
and authorization complexity. Use REST/gRPC where they're simpler.
