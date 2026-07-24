# API Versioning

> **Category:** API Design

---

**API Versioning** is the practice of managing changes to an API interface without breaking existing client integrations. When non-backward-compatible modifications occur (removing fields, altering data types, or changing endpoint semantics), a new version must be exposed.

### API Version Routing Topology

```
+-------------------------------------------------------------------------+
|                    API GATEWAY VERSION ROUTING                          |
+-------------------------------------------------------------------------+

  [ Ingress Request ]
          |
          v
  +-----------------------------------------------------------------------+
  | API GATEWAY (Inspects URI / Header / Query Param)                     |
  +-----------------------------------------------------------------------+
          |                                       |
          | (Route /v1/users)                     | (Route /v2/users)
          v                                       v
  [ Legacy V1 Service Cluster ]          [ Modern V2 Service Cluster ]
  {"user_name": "Alice"}                 {"first_name": "Alice", "last_name": "Smith"}
```

### API Versioning Strategies Comparison

| Strategy | Implementation Syntax | Pros | Cons | Industry Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| **URI Path Versioning** | `https://api.com/v1/users` | Highly explicit, easy to route at Gateway, easily tested in browser. | Pollutes URI space; feels like different resource. | Google, Twitter, GitHub |
| **Custom Request Header**| `X-API-Version: 2` | Clean URIs; separates resource path from metadata. | Harder to test in browser; breaks simple browser caching. | Stripe (Date-based versioning) |
| **Accept Header (Content Negotiation)**| `Accept: application/vnd.company.v2+json` | RESTfully pure; leverages media type negotiation. | High complexity for clients and API gateway routing logic. | GitHub Enterprise API |
| **Query Parameter** | `https://api.com/users?version=2` | Simple implementation; easy default fallback. | Can be missed by caching proxies if query params are ignored. | Amazon AWS APIs |

### Non-Breaking vs. Breaking Changes

- **Non-Breaking (No New Version Needed)**: Adding new optional request parameters, adding new fields to JSON response payloads.
- **Breaking (Requires New Major Version)**: Renaming/deleting response fields, changing field data types (string to array), altering authentication mechanics.

### Key takeaway

Use **URI Path Versioning (`/v1/resource`)** for public APIs due to its transparency, caching friendliness, and simple Gateway routing. Reserve new major versions strictly for breaking changes.
