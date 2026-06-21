# Design Ride Matching System

> **Category:** Location Based Systems

---

Design the matching subsystem for a ride-hailing app.

### Requirements
- **Functional**: when rider requests, find nearby drivers; offer; match first accept.
- **Non-functional**: low-latency (<2s to match); fairness.

### Architecture
```
[Rider request] -> [Matching service]
                     |
                     v
                  Query nearby drivers (geohash)
                     |
                     v
                  Offer to top N drivers (push)
                     |
                  First accept -> match
                  Others -> cancel
```

### Driver state
- Available / busy / offline.
- Location updated every few seconds.
- Indexed by geohash.

### Nearby query
- Geohash prefix query (drivers in same cell + neighbors).
- Filter by availability.

### Offering
- Push notification to top N candidates.
- Wait for first accept (with timeout).
- Cancel others.

### Fairness
- Rotate offers (don't always offer same driver).
- Acceptance rate tracking.

### Key takeaway
Ride matching = geohash-indexed driver locations + nearby query + parallel offers + first
accept wins. Track driver state + acceptance rates for fairness. Timeout to handle no-accepts.
