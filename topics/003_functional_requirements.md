# Functional Requirements

> **Category:** System Design Basics

---

Functional Requirements (FRs) define **what a system must do**. They detail the specific capabilities, features, API behaviors, data inputs, and system operations visible to users and external services. Establishing precise functional requirements is the initial step in any system design project or engineering interview.

### Functional Requirement Discovery Pipeline

```
+-------------------------------------------------------------------------+
|                    REQUIREMENT DISCOVERY PIPELINE                       |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ User Persona ]                                                       |
|        |                                                                |
|        v                                                                |
|  [ User Actions / Use Cases ] ---> (e.g., "Post Tweet", "Follow User")  |
|        |                                                                |
|        v                                                                |
|  [ System Inputs & Outputs ] ---> (e.g., Image Upload, Push Notif)      |
|        |                                                                |
|        v                                                                |
|  [ Explicit API Endpoints ]  ---> (POST /v1/tweets, GET /v1/timeline)   |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Examples Across Real-World Distributed Systems

| System | Core Functional Requirements | Out-of-Scope (Non-Goals) |
| :--- | :--- | :--- |
| **URL Shortener (TinyURL)** | • Generate short alias from long URL.<br>• Redirect alias to original URL.<br>• Custom alias support. | • Analytics dashboard.<br>• User login and permissions. |
| **E-Commerce (Amazon)** | • Search product catalog.<br>• Add items to cart.<br>• Process checkout & payments. | • Real-time warehouse robotics routing.<br>• Third-party seller tax auditing. |
| **Ride Sharing (Uber)** | • Riders request a ride with pickup/destination.<br>• Match rider with nearest driver.<br>• Real-time driver location updates. | • Driver vehicle insurance management.<br>• In-car entertainment system. |
| **Messaging System (WhatsApp)** | • Send/receive 1-on-1 text messages.<br>• Support media attachments (images/video).<br>• Delivery & Read receipts. | • Live video streaming broadcasts.<br>• Built-in payment gateway. |

### How to Define Functional Requirements in Interviews

1. **Focus on Core User Workflows**: Avoid listing dozens of minor features. Identify 3-4 primary user stories that capture the core value proposition.
2. **Explicitly State Inputs and Outputs**: Specify payloads, parameters, and returned data formats (e.g., JSON response schemas).
3. **Establish System Boundaries & Non-Goals**: Clearly define what the system *will not* do in the current scope. Defining non-goals prevents feature creep and keeps design discussions focused.
4. **Identify Dependencies**: Document reliance on external payment gateways, third-party authentication (OAuth), or external notification systems (APNS/FCM).

### Key takeaway

Functional Requirements define the **core capability boundaries** of a system. Clarifying FRs and non-goals up front preventsScope Creep and ensures the resulting system architecture accurately implements the intended product capabilities.
