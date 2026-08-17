# Design Food Delivery App
> **Category:** Location Based Systems

---

### Overview
A **Food Delivery App** (e.g., DoorDash, UberEats, Deliveroo) operates a complex three-sided marketplace connecting **Customers**, **Restaurants**, and **Delivery Partners (Drivers)**.

The system orchestrates real-time order lifecycle state machines, dynamic prep-time estimation, spatio-temporal driver assignment, and live GPS delivery tracking.

### System Architecture & Three-Sided Marketplace Topology

```
+------------------+     1. Place Order (POST /v1/orders)    +--------------------+
| Customer App     | --------------------------------------> | API Gateway        |
+------------------+                                         +--------------------+
         ^                                                             |
         | 5. Live Tracking                                            v 2. Dispatch Order
         +--------------------------------------------------- +--------------------+
                                                              | Order Lifecycle    |
                                                              | State Machine      |
                                                              +--------------------+
                                                                 /              \
                                      3. Accept & Kitchen Prep  /                \ 4. Assign Nearby Driver
                                                               v                  v
                                                     +------------------+  +--------------------+
                                                     | Restaurant Portal|  | Driver Matching    |
                                                     | & Tablet App     |  | Service (H3 / SFU) |
                                                     +------------------+  +--------------------+
```

### Key Technical Mechanics
1. **Three-Sided State Machine:** Manages state transitions across all three actors:
   - `ORDER_PLACED` arrow `RESTAURANT_ACCEPTED` arrow `KITCHEN_PREPARING` arrow `DRIVER_ASSIGNED` arrow `DRIVER_PICKED_UP` arrow `DELIVERED`.
2. **Estimated Time of Arrival (ETA) Engine:** Predicts total delivery time:

**Total ETA** = Tₖitchen_prep + T_driver_to\ᵣestaurant + T_transit_to_customer

   - Uses machine learning models trained on historic restaurant prep speeds, time of day, and live traffic conditions.
3. **Driver-to-Order Assignment:** Matches unassigned orders with nearby drivers using spatio-temporal algorithms (evaluating driver distance to restaurant, driver heading, and kitchen prep completion timestamp).

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/orders` | POST | `{"customer_id": "c_99", "restaurant_id": "rest_104", "items": [{"id": "item_1", "qty": 2}]}` | `{"order_id": "ord_881", "status": "ORDER_PLACED", "estimated_eta_min": 35}` |
| `/api/v1/orders/{id}/status`| PUT | `{"actor": "RESTAURANT", "status": "KITCHEN_PREPARING", "prep_time_min": 20}` | `{"status": "UPDATED"}` |

### Order & Delivery Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `order_id` | UUID | CockroachDB / PostgreSQL | Unique Primary Key for order ledger. |
| `customer_id` | String | Relational DB | Customer user account ID. |
| `restaurant_id` | String | Relational DB | Restaurant merchant account ID. |
| `driver_id` | String | Relational DB | Assigned delivery partner driver ID. |
| `order_status` | Enum | Relational DB | Current state in 3-sided state machine. |
| `eta_delivery_time`| Timestamp | Relational DB | Dynamically calculated delivery completion timestamp. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Distributed Transactional State Engine**| Prevents invalid state transitions (e.g., driver picking up un-prepared food). | High operational complexity enforcing 3-way distributed consensus. | Essential for multi-sided marketplace platforms. |
| **Dynamic ML ETA Estimation** | Improves customer satisfaction by providing accurate real-time delivery expectations. | Requires continuous model retraining on historical kitchen prep times and traffic data. | On-demand food and grocery delivery apps. |
| **Driver Batching (Multi-Order Delivery)**| Increases driver earnings and platform delivery capacity by batching nearby orders. | Risk of delaying first customer's food if second restaurant prep is delayed. | High-density urban food delivery networks. |

### Key takeaway
A **Food Delivery App** coordinates a three-sided marketplace (Customer, Restaurant, Driver) using a **Transactional Order State Machine**, real-time **ML ETA Estimation Models**, and spatial driver dispatch matching.
