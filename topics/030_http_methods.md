# HTTP Methods

> **Category:** Networking Basics

---

**HTTP Request Methods** (verbs) specify the intended action to be performed on a target resource defined by a URI. Designing clean RESTful APIs requires adhering strictly to method semantics, safe operation guarantees, and idempotency rules.

### Method Execution & Resource Lifecycle

```
+-------------------------------------------------------------------------+
|                     RESTFUL HTTP METHOD SEMANTICS                       |
+-------------------------------------------------------------------------+

  [ GET /users/123 ]    ---> Read User Record (Safe & Idempotent)
  [ POST /users ]       ---> Create New User Record (Non-Idempotent)
  [ PUT /users/123 ]    ---> Replace Complete User Record (Idempotent)
  [ PATCH /users/123 ]  ---> Partial Update User Record (Idempotent/Non-Idempotent)
  [ DELETE /users/123 ] ---> Delete User Record (Idempotent)
```

### HTTP Method Properties Matrix

| HTTP Method | Operations | Request Body? | Response Body? | Safe? | Idempotent? | Cacheable? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | Retrieve resource data | No | Yes | **Yes** | **Yes** | **Yes** |
| **POST** | Create new subordinate resource | Yes | Yes | No | **No** | Only with explicit headers |
| **PUT** | Replace target resource entirely | Yes | Yes | No | **Yes** | No |
| **PATCH** | Partial resource modifications | Yes | Yes | No | Depends | No |
| **DELETE** | Remove target resource | Optional | Optional | No | **Yes** | No |
| **HEAD** | Retrieve HTTP headers only | No | No | **Yes** | **Yes** | **Yes** |
| **OPTIONS**| Query supported methods (CORS) | No | Yes | **Yes** | **Yes** | No |

### Semantics: Safe vs. Idempotent Operations

- **Safe Method**: Calling the endpoint does not modify server state (read-only operations like `GET` and `HEAD`).
- **Idempotent Method**: Executing a request 1 time or 100 times sequentially leaves the server in the exact same state (e.g., `PUT`, `DELETE`).

### Common API Design Violations

1. **Using GET for State Mutations**: Executing `GET /users/delete?id=123` allows search engine web crawlers to accidentally delete database records.
2. **Confusing PUT and PATCH**: `PUT` requires sending the full resource payload (replacing omitted fields with `null`), whereas `PATCH` sends only modified fields.

### Key takeaway

Adhere strictly to HTTP method semantics: use **GET** for safe reads, **POST** for creating resources, **PUT** for complete replacements, **PATCH** for partial edits, and **DELETE** for removals. Enforce **idempotency** on `PUT` and `DELETE`.
