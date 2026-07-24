# Authorization
> **Category:** Security

---

### Overview
**Authorization (AuthZ)** is the process of determining whether an authenticated identity has permission to perform a specific action on a specific resource. It answers the security question: *"Are you allowed to do this?"*

### Authorization Decision Pipeline

```
+--------------+    1. Request (Subject, Action, Resource)    +-------------------+
| API Gateway  | -------------------------------------------> | Policy Engine     |
| / Service    |                                              | (OPA / Cedar)     |
+--------------+                                              +-------------------+
       ^                                                                |
       |                                                                | 2. Evaluate Policy
       |             3. Decision (Allow / Deny)                         v
       +------------------------------------------------------ +-------------------+
                                                               | Policy Rules /    |
                                                               | ACL Data Store    |
                                                               +-------------------+
```

### Authorization Models Comparison

| Model | Mechanics | Ideal Use Case | Pros | Cons |
|---|---|---|---|---|
| **RBAC** (Role-Based) | Permissions mapped to Roles; Users assigned Roles | Corporate enterprise systems | Simple to manage & audit | Role explosion as conditions grow |
| **ABAC** (Attribute-Based)| Rules rely on Subject, Resource, Action, & Context (IP, Time) | Fine-grained compliance systems | Extremely flexible & dynamic | Complex rule engine evaluation |
| **ReBAC** (Relationship-Based)| Access granted based on graph relationships (e.g., Google Zanzibar) | Google Drive, Notion, Social Networks | Scales to billions of object-level permissions | Complex graph storage infrastructure |
| **ACL** (Access Control List)| Explicit list of permissions per resource | File systems, S3 bucket policies | Direct object permission control | Difficult to audit enterprise-wide |

### API Policy Definition Example (Open Policy Agent - Rego)
```rego
package httpapi.authz

default allow = false

# Allow admin users full access
allow {
    input.user.role == "admin"
}

# Allow document owners to read/write their document
allow {
    input.method == "GET"
    input.user.id == input.document.owner_id
}
```

### Architecture Enforcement Patterns
- **PEP (Policy Enforcement Point)**: API Gateway or Middleware intercepting incoming requests.
- **PDP (Policy Decision Point)**: Microservice or embedded library (e.g., OPA) evaluating authorization policies.

### Key takeaway
**Authorization** grants or denies permissions. Modern microservice architectures decouple enforcement from business logic by establishing a centralized Policy Decision Point using **RBAC** or **ReBAC (Zanzibar model)**.
