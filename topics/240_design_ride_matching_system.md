# Design Ride Matching System
> **Category:** Location Based Systems

---

### Overview
A **Ride Matching System** is the core algorithmic dispatch engine inside ride-hailing platforms (Uber, Ola, Lyft) responsible for pairing rider pickup requests with optimal nearby drivers in real time.

The system solves two major computational problems: **Dynamic Surge Pricing** (balancing local supply and demand in real time) and **Optimal Bipartite Matching** (using the Hungarian Algorithm or Batch Matching to minimize overall system ETA).

### System Architecture & Ride Matching Topology

```
+--------------------------------------------------------------------------+
| RIDER PICKUP REQUEST (Lat, Long, Destination)                            |
+--------------------------------------------------------------------------+
                                     |
                                     v 1. Ingest Ride Request
+--------------------------------------------------------------------------+
| RIDE MATCHING DISPATCH ENGINE                                            |
+--------------------------------------------------------------------------+
          |                                                   |
          | 2. Fetch H3 Cell Supply/Demand Ratio              | 3. Query Nearby Idle Drivers
          v                                                   v
+------------------------------------+             +------------------------------------+
| DYNAMIC SURGE PRICING ENGINE       |             | GEOSPATIAL DRIVER STORE            |
| Computes Cell Surge Multiplier 1.8x|             | (Uber H3 Index in Redis)           |
+------------------------------------+             +------------------------------------+
          \                                                   /
           \ 4. Input Drivers + Riders into Batch Matcher     /
            v                                                v
+--------------------------------------------------------------------------+
| OPTIMAL BIPARTITE MATCHING ENGINE (Kuhn-Munkres / Hungarian Algorithm)   |
| Minimizes Total Combined Pick-up ETA across 10-second batch window       |
+--------------------------------------------------------------------------+
                                     |
                                     v 5. Dispatch Offer to Driver
+--------------------------------------------------------------------------+
| DRIVER MOBILE APP (20-Second Acceptance Window)                          |
+--------------------------------------------------------------------------+
```

### Key Technical Mechanics
1. **Optimal Batch Bipartite Matching:** Instead of greedily matching the first available driver to a rider, the system queues requests in 10-second batch windows. It constructs a bipartite graph (Riders r→ Drivers) and executes the **Kuhn-Munkres (Hungarian) Algorithm** to minimize the *total aggregate pickup ETA* across all riders in the cell.
2. **Dynamic Surge Pricing Engine:** Calculates the supply/demand ratio within each Uber H3 Hexagon cell every 10 seconds:

**Surge Multiplier** = f((Active Rider Requests) / (Available Idle Drivers))

   - If demand exceeds supply in a cell, surge pricing increases fares to encourage more drivers to navigate to the high-demand hexagon.
3. **Driver Offer Timeout Handling:** Gives the matched driver 20 seconds to accept the offer. If declined or timed out, the dispatch engine instantly re-matches the rider with the next optimal candidate.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/dispatch/match` | POST | `{"trip_id": "t_99", "pickup_h3": "8828308281fffff"}` | `{"status": "MATCHING", "batch_window_sec": 10}` |
| `/api/v1/dispatch/offer` | POST | `{"driver_id": "d_881", "trip_id": "t_99", "action": "ACCEPT"}` | `{"status": "CONFIRMED", "pickup_lat": 37.77, "pickup_lng": -122.41}` |

### Ride Matching Ledger Schema

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `match_id` | UUID | CockroachDB / Cassandra| Primary Key for matching transaction log. |
| `trip_id` | String | Relational DB | Associated trip request ID. |
| `driver_id` | String | Relational DB | Matched driver candidate ID. |
| `h3_cell_id` | String | Redis Cache | H3 Hexagon cell where match was computed. |
| `surge_multiplier` | Float (e.g., 1.8)| Redis / Database | Surge pricing multiplier applied at time of match. |
| `est_pickup_eta_sec`| Integer | Database | Estimated pickup duration in seconds. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Batch Matching (10s Window) vs Greedy Matching**| Reduces total system-wide pickup ETA by 15-20%; optimal driver utilization. | Introduces a 10-second wait delay before rider receives initial driver assignment. | High-density urban ride-hailing networks. |
| **Hexagonal Cell Surge Pricing (H3)** | Smoothly balances local driver supply and rider demand; prevents localized shortages. | Price spikes can frustrate riders if surge boundaries feel arbitrary. | Dynamic pricing engines in two-sided ride marketplaces. |
| **Timeout Re-Dispatch Queue** | Handles driver rejections gracefully without canceling the rider's trip request. | Increases total match latency if multiple drivers reject consecutive offers. | Real-time driver dispatch architectures. |

### Key takeaway
A **Ride Matching System** optimizes dispatch efficiency by evaluating 10-second request batches using **Bipartite Graph Matching (Hungarian Algorithm)** to minimize total pickup ETA, balancing local market supply and demand via **H3 Hexagonal Surge Pricing**.
