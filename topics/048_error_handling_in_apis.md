# Error Handling in APIs

> **Category:** API Design

---

**API Error Handling** is the practice of capturing runtime failures and presenting **clear, standardized, actionable error responses** to API consumers. Proper error handling avoids leaking internal stack traces while providing clients with exact failure diagnostics.

### Centralized Exception Handling Architecture

```
+-------------------------------------------------------------------------+
|                  CENTRALIZED API ERROR HANDLING PIPELINE                |
+-------------------------------------------------------------------------+

  [ Client Request ]
          |
          v
  +-----------------------------------------------------------------------+
  | CONTROLLER / APPLICATION SERVICE                                      |
  | Raises Exception: EntityNotFoundException / ValidationException       |
  +-----------------------------------------------------------------------+
          |
          v
  +-----------------------------------------------------------------------+
  | GLOBAL EXCEPTION HANDLER MIDDLEWARE (@ControllerAdvice)               |
  | Maps Exception -> Logs Error -> Sanitizes Trace -> Formats RFC 7807  |
  +-----------------------------------------------------------------------+
          |
          v
  [ Return Structured JSON Payload + Standard HTTP Status Code ]
```

### Standardized Error Payload (RFC 7807 Problem Details)

The IETF RFC 7807 standard defines a universal JSON schema for API errors:

| Field Key | Type | Description | RFC 7807 Example |
| :--- | :--- | :--- | :--- |
| **`type`** | URI string | A URI reference identifying the specific error type definition. | `"https://api.example.com/errors/invalid-payment"` |
| **`title`** | String | A short, human-readable summary of the error type. | `"Invalid Payment Method"` |
| **`status`** | Integer | The HTTP status code generated for this occurrence. | `400` |
| **`detail`** | String | A detailed human-readable explanation specific to this occurrence.| `"Credit card number 4111... has expired."` |
| **`instance`** | URI string | A URI reference identifying the specific occurrence log trace. | `"/v1/payments/pay_9001/errors/tr_123"` |
| **`invalid_params`**| Array | Field-level validation failure details. | `[{"name": "cvv", "reason": "CVV is required"}]` |

### Concrete RFC 7807 JSON Response Example

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Your request parameters failed validation",
  "status": 400,
  "detail": "One or more fields in the request payload were invalid.",
  "instance": "/v1/orders/err_8841",
  "invalid_params": [
    {
      "name": "quantity",
      "reason": "Must be greater than 0"
    }
  ]
}
```

### Key takeaway

Implement global exception handling middleware to format all API failures into standardized **RFC 7807 Problem Details JSON payloads**. Never leak raw stack traces to production clients.
