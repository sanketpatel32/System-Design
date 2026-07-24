# Authorization
> **Category:** Security

---

### Overview
**Authorization (AuthZ)** is the security framework that determines whether an authenticated identity has permission to perform a specific action on a targeted resource. It answers the fundamental question: *"Are you allowed to do this?"*

Authorization takes place after successful Authentication. Enterprise systems implement authorization models ranging from simple **Role-Based Access Control (RBAC)** to fine-grained **Attribute-Based Access Control (ABAC)** and Google Zanzibar-style **Relationship-Based Access Control (ReBAC)**.

### Enterprise Policy Decision Topology (PDP / PEP Pattern)

```
+-------------------+     1. Request (POST /document/99)    +--------------------+
| Client / User     | -----------------------------------> | Policy Enforcement |
+-------------------+                                      | Point (PEP / GW)   |
                                                           +--------------------+
                                                                     |
                                                                     v 2. Check Permission
                                                           +--------------------+
                                                           | Policy Decision    |
                                                           | Point (PDP / OPA)  |
                                                           +--------------------+
                                                                     |
                                                                     v 3. Query Tuple/Rules
                                                           +--------------------+
                                                           | Policy Store / DB  |
                                                           | (Zanzibar Tuples)  |
                                                           +--------------------+
```

### Authorization Architectural Models

| Model | Structural Basis | Rule Complexity | Ideal Scale |
|---|---|---|---|
| **RBAC (Role-Based)** | Binds permissions to statically defined roles (e.g., `Admin`, `Editor`, `Viewer`). | Low complexity; static role assignments. | Small to medium enterprise web applications. |
| **ABAC (Attribute-Based)** | Evaluates dynamic attributes of User, Resource, and Context (e.g., `Time < 5pm`, `IP == Corp`).| High complexity; dynamic policy evaluation via OPA (Open Policy Agent). | Highly regulated systems with contextual policy rules. |
| **ReBAC (Relationship-Based)**| Evaluates graph paths of ownership and membership (e.g., `User X is member of Team Y which owns Doc Z`).| Graph traversal engine; extreme scalability (Google Zanzibar pattern). | Large-scale collaborative platforms (Google Docs, Figma). |

### API Interface & Policy Evaluation Schema

| API Endpoint / Evaluator | Method | Request Context Payload | Decision Output |
|---|---|---|---|
| `POST /v1/authorize` | POST | `{"user_id": "u123", "action": "READ", "resource": "doc_99"}` | `{"allow": true, "reason": "MATCH_ROLE_EDITOR"}` |
| `POST /v1/check_tuple` | POST | `{"namespace": "doc", "object": "99", "relation": "viewer", "subject": "user:123"}` | `{"allowed": true}` |

### Policy Data Model (ReBAC Tuple Schema)

| Field Name | Data Type | Storage Engine | Description / Purpose |
|---|---|---|---|
| `namespace` | String | CockroachDB / Spanner | Resource type category (e.g., `document`, `folder`, `organization`). |
| `object_id` | String | Distributed SQL | Unique ID of the target resource. |
| `relation` | String | Distributed SQL | Permission relation (e.g., `owner`, `editor`, `viewer`, `parent_folder`). |
| `subject_type` | String | Distributed SQL | Identity classification (`user`, `group`, `service_account`). |
| `subject_id` | String | Distributed SQL | Unique ID of the authorized subject. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Centralized Authorization (OPA / Zanzibar)**| Single source of truth for authorization logic; easy compliance auditing. | Introduces network latency on every authorization decision hop. | Multi-tenant SaaS platforms with complex permission structures. |
| **Decentralized / Local In-Memory AuthZ** | Sub-millisecond policy check execution within microservice memory. | Permission revocation lag; policy sync discrepancies across nodes. | Ultra-low latency microservice architectures. |
| **RBAC over ReBAC** | Extremely straightforward database design (`user_roles`, `role_permissions`). | Explodes in complexity ("role explosion") when fine-grained per-object permissions are needed. | Standard SaaS administrative portals. |

### Key takeaway
**Authorization** controls resource access post-authentication. Scalable system designs decouple Policy Enforcement Points (PEP) from Policy Decision Points (PDP), transitioning from simple RBAC to graph-based ReBAC (Zanzibar) or attribute-based ABAC (OPA) as permission complexity grows.
