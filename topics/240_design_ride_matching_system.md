# Design Ride Matching System
> **Category:** Location Based Systems

---

### Overview
A **Ride Matching System** matches ride-hailing passengers with optimal drivers in real time, minimizing ETA and driver idle time while maximizing driver acceptance rates.

### System Architecture Pipeline

```
+---------------+     1. Ride Request (Pickup + Dropoff)     +-------------------+
| Passenger App | -----------------------------------------> | Matching Engine   |
+---------------+                                            +-------------------+
                                                                       |
                                                                       v 2. Spatial Query (Radius R)
                                                             +-------------------+
                                                             | Redis Geohash /   |
                                                             | H3 Spatial Store  |
                                                             +-------------------+
                                                                       |
                                                                       v 3. Driver Candidate List
                                                             +-------------------+
                                                             | Match Ranker &    |
                                                             | Scoring Model     |
                                                             +-------------------+
                                                                       |
                                                                       v 4. Offer Ride via WebSocket
                                                             +-------------------+
                                                             | Driver App        |
                                                             +-------------------+
```

### Driver Match Scoring Function

$$\text{Score} = w_1 \cdot \text{ETA} + w_2 \cdot (1 - \text{Driver Accept Rate}) + w_3 \cdot \text{Heading Angle Match}$$

Where:
- $\text{ETA}$: Projected arrival time of driver at pickup location.
- $\text{Driver Accept Rate}$: Historical probability driver will accept the dispatch.
- $\text{Heading Angle Match}$: Alignment between driver's current driving direction and pickup spot.

### Batch Matching Strategy (Hungry Algorithm / Kuhn-Munkres)
Instead of greedy 1-to-1 matching on request arrival, group passenger requests into **2-second batch windows** and solve bipartite graph matching to optimize global system ETA across all passengers:

```
Passengers (P1, P2) <--- Bipartite Graph Matching Optimization ---> Drivers (D1, D2)
```

### Key takeaway
Optimize ride matching using **batch windowing** (2-second intervals) evaluated via **bipartite graph algorithms (Kuhn-Munkres)**, scoring candidates on ETA, driver heading, and historical acceptance probability.
