# API Authorization

> **Category:** API Design

---

**API Authorization** is the process of verifying **what permissions and actions an authenticated identity is allowed to perform** on a specific resource. Authorization answers the core security question: *"Are you allowed to do this?"*

### Centralized Policy Enforcement Architecture

```
+-------------------------------------------------------------------------+
|                  POLICY ENFORCEMENT POINT (PEP) FLOW                    |
+-------------------------------------------------------------------------+

  [ Authenticated Client ] (JWT Claims: { role: "editor", department: "sales" })
             |
             | Request: DELETE /v1/documents/99
             v
  +-----------------------------------------------------------------------+
  | POLICY ENFORCEMENT POINT (PEP / API Gateway / Service)                |
  +-----------------------------------------------------------------------+
             |
             v (Evaluate Policy: Can editor in sales DELETE doc 99?)
  +-----------------------------------------------------------------------+
  | POLICY DECISION POINT (PDP / Open Policy Agent OPA / Casbin)          |
  +-----------------------------------------------------------------------+
             |
             +-----------------------+-----------------------+
             | (Allowed: True)       | (Allowed: False)      |
             v                       v                       v
  [ Forward to Backend Service ]  [ Return HTTP 403 Forbidden ]
```

### Authorization Models Comparison

| Authorization Model | Mechanism | Granularity | Complexity | Best Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| **RBAC (Role-Based Access Control)** | Permissions tied to named roles (`Admin`, `Editor`, `Viewer`). Users assigned roles. | Coarse-Grained | Low | Standard SaaS apps, administrative portals |
| **ABAC (Attribute-Based Access Control)**| Permissions dynamically evaluated on user, resource, and environment attributes. | Fine-Grained | High | Enterprise security, HIPAA/GDPR compliance data access |
| **ReBAC (Relationship-Based)** | Permissions granted based on object relationships (Google Zanzibar model). | Ultra Fine-Grained | Very High | Google Drive sharing ("User X is Owner of Doc Y") |
| **ACL (Access Control Lists)** | Explicit list of permitted users attached directly to each individual object. | Fine-Grained | Medium | File systems, AWS S3 bucket policies |

### HTTP Authorization Responses

- **401 Unauthorized**: Authentication missing or invalid token (*"Who are you?"*).
- **403 Forbidden**: Identity verified, but client lacks permission for action (*"You shall not pass"*).

### Key takeaway

Decouple authorization logic from application code using standardized policy engines (**Open Policy Agent - OPA**). Implement **RBAC** for simple role enforcement and **ABAC / ReBAC** for fine-grained object-level access controls. Return **403 Forbidden** on authorization failure.
