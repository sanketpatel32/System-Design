# API Authorization

> **Category:** API Design

---

Authorization = **"are you allowed to do this?"** — happens after authentication. Decides
whether an authenticated user may perform the requested action.

### Models
| Model | Description |
|-------|-------------|
| **RBAC** (Role-Based) | User has a role (admin, editor, viewer); role grants permissions. |
| **ABAC** (Attribute-Based) | Permissions based on attributes (user dept, resource owner, time of day). |
| **ACL** | Per-resource list of allowed users. |
| **ReBAC** (Relationship-Based) | Google Zanzibar-style: relations between objects ("alice is owner of doc:1"). |

### RBAC example
```python
@require_role("editor")
def update_article(id): ...
```
Simple, common. Doesn't scale to fine-grained ("alice can edit only her own articles").

### ABAC example
```
ALLOW update_article IF
  user.role == "editor" AND
  article.author_id == user.id AND
  time.now() < article.deadline
```
More expressive; needs an engine (OPA, Cedar).

### AuthZ vs AuthN
- **AuthN** = who you are (login).
- **AuthZ** = what you can do (permissions).
- You can be authenticated but unauthorized (401 vs 403).

### Where to enforce
- **At the gateway**: coarse (this user can hit `/admin` at all?).
- **In the service**: fine-grained (can this user edit this article?).
- **At the data layer**: row-level security in Postgres.

### Common bugs
- **BOLA** (Broken Object-Level Authorization) — forgot to check ownership. OWASP #1.
- **Forced browsing** — `/users/123` works because user is logged in, but they aren't user 123.
- **Mass assignment** — request includes `role=admin`, you blindly save it.

### Key takeaway
Authorization is **per-request, per-resource**. After auth'ing the user, always check they can
do this specific action on this specific resource. OWASP's #1 API risk is broken object-level
authorization — get this right.
