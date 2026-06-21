# API Versioning

> **Category:** API Design

---

API versioning lets you **evolve** the contract without breaking existing clients. Critical
for any public API.

### Why version
- Renaming a field breaks every client reading it.
- Removing a field breaks every client reading it.
- Changing a type (string → int) breaks every client.
- New required field breaks every client.

### Approaches
| Method | Example | Pros | Cons |
|--------|---------|------|------|
| URL path | `/v1/users` | Obvious, cacheable | URL churn |
| Query param | `/users?version=1` | URL stable | Easy to forget |
| Header | `Accept: application/vnd.acme.v1+json` | Clean URL | Hard to test in browser |
| Content negotiation | `Accept` header | RESTful | Less discoverable |

**Recommendation**: **URL path** (`/v1`, `/v2`). Easiest for clients, easiest to route in LBs,
easy to debug.

### Backward vs forward compatibility
- **Backward compatible** (preferred): old clients work with new server. Add fields, don't remove
  or rename.
- **Forward compatible**: new clients work with old server. Hard — usually just retry/fallback.

### Deprecation workflow
1. Mark old version **deprecated** in docs and headers (`Sunset`, `Deprecation`).
2. Add metrics on which clients still call it.
3. Email top consumers, give 6-12 month window.
4. Return 410 Gone after the sunset date.

### Real-world
- Stripe, GitHub: URL versioning (`/v1`, `/v2`), backward compatible within a version.
- Twilio: URL versioning with multi-year deprecations.

### Key takeaway
Always version. Prefer **URL path** versioning. Within a version, only make **backward-
compatible** changes (add fields, never rename/remove). Sunset old versions on a schedule.
