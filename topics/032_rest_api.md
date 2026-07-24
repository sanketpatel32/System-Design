# REST API

> **Category:** Networking Basics

---

**REST (Representational State Transfer)** is an architectural style for designing networked APIs using stateless, client-server communication over standard HTTP. Introduced by Roy Fielding, REST treats data resources as URIs that can be manipulated using standard HTTP verbs.

### REST Architectural Interaction Topology

```
+-------------------------------------------------------------------------+
|                       REST ARCHITECTURE TOPOLOGY                        |
+-------------------------------------------------------------------------+

  [ Client / SPA / Mobile ]
             |
             |  1. Request: GET /v1/users/42 (Accept: application/json)
             v
  +-----------------------------------------------------------------------+
  | REST API SERVER                                                       |
  | Stateless Request Processing -> Fetches Entity -> Serializes to JSON |
  +-----------------------------------------------------------------------+
             |
             |  2. Response: 200 OK (Content-Type: application/json)
             v  Payload: {"id": 42, "name": "Alice", "role": "admin"}
  [ Client Application ]
```

### The 6 Core Constraints of REST Architecture

| Constraint | Description | Engineering Benefit |
| :--- | :--- | :--- |
| **Client-Server** | Separation of user interface concerns from data storage concerns. | Independent evolution of web/mobile clients and server backends. |
| **Statelessness** | Every request contains all session data required; server stores no client context. | Massive horizontal scalability across stateless application servers. |
| **Cacheability** | Responses must implicitly or explicitly define themselves as cacheable (`Cache-Control`). | Reduces network latency and server load via browser/CDN caches. |
| **Uniform Interface**| Consistent resource identification (URIs), representation manipulation, and self-descriptive messages. | Simplified client integrations and uniform system design. |
| **Layered System** | Client cannot tell whether it is connected directly to end server or proxy/load balancer. | Enables transparent insertion of CDNs, API Gateways, and Caches. |
| **Code on Demand**| Optional capability where servers temporarily extend client functionality by transferring executable code (e.g., JS). | Extends client capabilities dynamically. |

### REST Resource Blueprint & Endpoint Design

| Operation | HTTP Verb | Example RESTful Endpoint | Response Code |
| :--- | :--- | :--- | :--- |
| **List Users** | `GET` | `/v1/users?page=1&limit=20` | `200 OK` |
| **Get User** | `GET` | `/v1/users/42` | `200 OK` / `404 Not Found` |
| **Create User** | `POST` | `/v1/users` | `201 Created` |
| **Replace User**| `PUT` | `/v1/users/42` | `200 OK` |
| **Delete User** | `DELETE` | `/v1/users/42` | `204 No Content` |

### Key takeaway

REST is a **stateless, resource-oriented architectural style** built on standard HTTP verbs and URIs. Decouple clients and servers by creating uniform JSON interfaces, enforcing stateless requests, and leveraging HTTP caching headers.
