# HTTP Status Codes

> **Category:** Networking Basics

---

**HTTP Status Codes** are 3-digit standardized integers issued by a server in response to a client's request. They communicate whether a specific HTTP request was successfully completed, redirected, blocked due to client error, or failed due to server error.

### Status Code Hierarchy & Decision Tree

```
+-------------------------------------------------------------------------+
|                   HTTP STATUS CODE CATEGORY TREE                        |
+-------------------------------------------------------------------------+

  1xx Informational ---> 101 Switching Protocols (WebSockets)
  2xx Success       ---> 200 OK, 201 Created, 204 No Content
  3xx Redirection   ---> 301 Moved Permanently, 304 Not Modified
  4xx Client Errors ---> 400 Bad Request, 401 Unauth, 403 Forbidden, 404 Not Found, 429 Too Many Requests
  5xx Server Errors ---> 500 Internal Error, 502 Bad Gateway, 503 Service Unavail, 504 Gateway Timeout
```

### Essential HTTP Status Codes Reference

| Code Class | Status Code | Name | Semantic Meaning & System Design Use Case |
| :--- | :--- | :--- | :--- |
| **2xx Success** | **200** | OK | Standard success for `GET`, `PUT`, `PATCH` requests. |
| | **201** | Created | Resource successfully created via `POST`. Returns `Location` header. |
| | **202** | Accepted | Request accepted for asynchronous processing (queued in Kafka/RabbitMQ). |
| | **204** | No Content | Action succeeded (`DELETE`), no response payload body returned. |
| **3xx Redirection**| **301** | Moved Permanently | Permanent URL redirect (cached by browsers and search engine SEO). |
| | **304** | Not Modified | Conditional `GET` validation; asset served from browser cache (`ETag`). |
| **4xx Client Error**| **400** | Bad Request | Malformed JSON, failed validation schema, or invalid request params. |
| | **401** | Unauthorized | Authentication missing or invalid JWT/API key token. |
| | **403** | Forbidden | Authenticated client lacks permissions (RBAC/ABAC authorization failure). |
| | **404** | Not Found | Requested URI resource endpoint does not exist. |
| | **409** | Conflict | Optimistic locking edit conflict or duplicate unique key constraint. |
| | **429** | Too Many Requests | Rate limit exceeded. Returns `Retry-After` response header. |
| **5xx Server Error**| **500** | Internal Error | Generic server application code unhandled exception. |
| | **502** | Bad Gateway | Nginx/ALB load balancer received invalid response from backend service. |
| | **503** | Service Unavailable| Server overloaded or down for maintenance. |
| | **504** | Gateway Timeout | Upstream service failed to respond before proxy socket timeout. |

### API Status Code Best Practices

1. **Avoid 200 OK for Errors**: Never return HTTP 200 OK with a body containing `{"status": "error"}`. It breaks HTTP caching proxies and client error handling.
2. **Include RFC 7807 Problem Details**: Return standardized structured JSON error details for 4xx/5xx responses.

### Key takeaway

Use standardized 3-digit HTTP status codes correctly: **2xx** for success, **3xx** for caching/redirects, **4xx** for client payload/auth errors, and **5xx** for infrastructure outages. Return **429** for rate limiting and **202** for async message queuing.
