# Design Good REST APIs

> **Category:** API Design

---

Designing high-quality RESTful APIs requires creating **intuitive, predictable, scalable, and resilient interfaces** that developers can easily consume. Clean API design adheres to established URI conventions, proper HTTP verbs, consistent error schemas, and backward compatibility rules.

### RESTful Resource Naming Architecture

```
+-------------------------------------------------------------------------+
|                  RESTFUL RESOURCE HIERARCHY STRUCTURE                   |
+-------------------------------------------------------------------------+

  /v1/users                             <-- Plural Noun Collection
    |
    +---> /v1/users/42                  <-- Specific Resource Instance
            |
            +---> /v1/users/42/orders   <-- Sub-resource Collection
                    |
                    +---> /v1/users/42/orders/9001  <-- Sub-resource Instance
```

### Core API Design Conventions

| Rule Domain | Correct REST Practice | Bad Anti-Pattern | Reason / Trade-off |
| :--- | :--- | :--- | :--- |
| **URI Resource Naming**| Plural Nouns (`/v1/orders`) | Verbs (`/v1/getAllOrders`) | HTTP Verbs (`GET`) already declare the action. |
| **Hierarchy Representation**| `/v1/users/42/orders` | `/v1/getOrdersForUser?id=42` | URIs model logical entity relationships. |
| **Filtering Parameters**| `/v1/products?category=tech` | `/v1/techProducts` | Keep resource endpoints clean; use query params for filtering. |
| **Field Format** | Lower camelCase (`createdAt`) | Mixed case (`Created_At`) | Establish uniform JSON payload keys. |
| **State Mutations** | `POST /v1/orders/9001/cancel` | `GET /v1/cancelOrder` | Use controller sub-actions when HTTP verbs are insufficient. |

### API Design Guidelines Checklist

1. **Use Plural Nouns**: Model endpoints as collections (`/users`, `/invoices`).
2. **Nest Related Sub-Resources**: Represent sub-entities under parent resources (`/authors/7/books`).
3. **Use Standard HTTP Verbs**: Match CRUD operations to `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
4. **Return Consistent JSON Error Payloads**: Structure errors with RFC 7807 (`type`, `title`, `status`, `detail`).
5. **Support Filtering, Sorting, and Pagination**: Keep responses bounded (`limit`, `offset`, `cursor`).

### Key takeaway

Design REST APIs using **plural nouns for resource paths**, standard HTTP verbs for operations, consistent camelCase JSON schemas, and nested URIs for hierarchical sub-resources. Provide clear error details and support pagination across all collection endpoints.
