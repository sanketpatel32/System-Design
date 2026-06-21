# Authorization

> **Category:** Security

---

Authorization = **deciding what an authenticated user can do.** "You're Alice, but can you
edit this article?"

### Models
- **RBAC** (Role-Based): roles (admin, editor, viewer) → permissions.
- **ABAC** (Attribute-Based): permissions based on attributes (dept, location, time).
- **ACL**: per-resource access list.
- **ReBAC** (Relationship-Based): Zanzibar-style, "alice owns doc:1".

### Where to enforce
- **API gateway**: coarse ("can user hit /admin?").
- **Service**: fine-grained ("can user edit article 123?").
- **Data layer**: row-level security (Postgres RLS).

### Common flaws (OWASP)
- **BOLA** (Broken Object-Level Authorization): user can access other users' objects.
  - Fix: check ownership on every object access.
- **Mass assignment**: request includes `role=admin`, app blindly saves.
  - Fix: whitelist fields.
- **Forced browsing**: `/users/123` works because user is logged in, but they're not user 123.
  - Fix: per-resource authorization checks.

### Implementation patterns
```python
@require_permission("edit_article")
def update_article(article_id, user):
    article = load_article(article_id)
    if article.author_id != user.id:
        raise Forbidden()
    update(article)
```

### Decisions
- **Centralize** authz logic (one service / library).
- **Deny by default**.
- **Log denials** (catch attack patterns).
- **Test authorization** explicitly (not just happy path).

### Multi-tenant
- Tenant isolation: user X can only see tenant X's data.
- Often enforced at the data layer (RLS, query filters).

### Key takeaway
Authorization is **per-request, per-resource**. After authenticating, check whether the user
can do this specific action on this specific resource. Don't trust client-side routing or
hidden fields. OWASP #1 API risk is broken object-level authz.
