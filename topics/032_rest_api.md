# REST API

> **Category:** Networking Basics

---

REST = **Representational State Transfer**. An architectural style for web APIs built on HTTP,
centered on **resources** identified by URLs.

### The 6 constraints (Fielding)
1. **Client-server** — separation of concerns.
2. **Stateless** — each request contains all info needed; no server session.
3. **Cacheable** — responses declare cacheability.
4. **Uniform interface** — resources, verbs, hypermedia.
5. **Layered** — intermediaries (proxies, gateways) allowed.
6. **Code-on-demand** (optional) — server can ship executable code (JS).

### Resource-oriented URLs
```
GET    /users              list users
POST   /users              create user
GET    /users/123          fetch one user
PUT    /users/123          replace user
PATCH  /users/123          partial update
DELETE /users/123          delete user
GET    /users/123/orders   nested resource (user's orders)
```

### Stateless
Each request carries everything needed (auth token, pagination cursor). The server doesn't
remember the client between requests → trivial horizontal scaling.

### Why REST dominates
- Simple, ubiquitous, every language has HTTP clients.
- Plays well with caching (CDN, browser).
- Self-descriptive via URLs and status codes.

### REST weaknesses
- **Over-fetching** — getting the whole user when you need just the email.
- **Under-fetching** — need 5 round trips to render a page (the "N+1" problem).
- **Versioning pain** — schema changes break clients.
- **Multiple updates** — "rename user and update billing" isn't one resource.

### When REST falls short
- Mobile apps that need curated payloads → consider GraphQL.
- Internal microservices needing strict schemas → gRPC.

### Key takeaway
REST is the default for public HTTP APIs. Master resource naming, statelessness, and HTTP status
codes — then know when GraphQL or gRPC are better fits.
