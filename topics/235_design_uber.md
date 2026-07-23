# Design Uber / Ola

> **Category:** Location Based Systems

---

Design Uber: match riders with drivers, route, pricing.

### Requirements
- **Functional**: request ride; match driver; ETA; route; price; complete trip.
- **Non-functional**: low-latency matching; real-time tracking.

### Architecture
```
[Rider app] <-> [API/WebSocket] <-> [Trip service]
[Driver app] <->                  [Matching service]
                                  [Location service (geohash)]
                                  [Pricing service]
                                  [Map service]
```

### Matching
- Rider requests → find nearby drivers (geohash query).
- Offer to nearest drivers (push notifications).
- First accept → match.

### Location tracking
- Drivers update location every few seconds.
- Indexed by geohash for spatial queries.

### ETA
- Road network + real-time traffic.
- Map service (Google Maps API, OSRM).

### Surge pricing
- Supply vs demand per region.
- Multiplier during peak.

### Trip flow
1. Rider requests.
2. Match to driver.
3. Driver navigates to rider.
4. Trip starts → track location.
5. Trip ends → price, payment.

### Key takeaway
Uber = matching service (geohash for nearby) + location tracking + ETA (map API) + surge
pricing. WebSockets for real-time updates. Driver location indexed for fast nearby queries.
