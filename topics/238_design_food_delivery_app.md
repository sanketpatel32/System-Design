# Design Food Delivery App
> **Category:** Location Based Systems

---

### Overview
A **Food Delivery App** (e.g., DoorDash, UberEats, Zomato, Swiggy) coordinates a 3-way marketplace: customers placing orders, restaurants fulfilling food preparation, and delivery couriers handling pickup and drop-off.

### System Architecture & State Machine

```
+---------------+     1. Place Order     +-------------------+     2. Assign Order     +-------------------+
| Customer App  | ---------------------> | Order Gateway     | ----------------------> | Restaurant App    |
+---------------+                        +-------------------+                         +-------------------+
        ^                                          |                                             |
        | 6. Live Map Tracking                     | 3. Order Ready                              v
        |                                          v                                   +-------------------+
        |                                +-------------------+                         | Food Preparation  |
        |                                | Matching Engine   |                         +-------------------+
        |                                +-------------------+                                   |
        |                                          | 4. Dispatch Courier                         |
        |                                          v                                             |
        |                                +-------------------+                                   |
        +------------------------------- | Courier App       | <---------------------------------+
                                         +-------------------+ 5. Pick Up Order
```

### Order Lifecycle State Machine
```
[ PLACED ] ---> [ CONFIRMED_BY_RESTAURANT ] ---> [ PREPARING ] ---> [ READY_FOR_PICKUP ]
                                                                             |
[ DELIVERED ] <--- [ ON_THE_WAY ] <--- [ PICKED_UP ] <-----------------------+
```

### Core Architecture Components

| Component | Engineering Implementation |
|---|---|
| **Menu & Catalog** | Cached in **Redis / CDN** for sub-10ms menu renders |
| **Order Management** | Transactional RDBMS (PostgreSQL) with Saga pattern for payment/stock locks |
| **Courier Dispatch** | Geohash spatial matching algorithm prioritizing courier proximity and kitchen readiness |
| **Live Tracking** | WebSocket stream forwarding courier GPS coordinates to customer map view |

### Key takeaway
Food Delivery Apps require a **3-way state machine** (Customer, Restaurant, Courier) orchestrated via the **Saga pattern** and coupled with **Geohash spatial dispatch algorithms**.
