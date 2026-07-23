# Design Nearby Friends

> **Category:** Location Based Systems

---

Design "find friends nearby" feature.

### Requirements
- **Functional**: see friends within X meters; updates in real-time.
- **Non-functional**: low-latency updates; privacy.

### Architecture
```
[Users update location] -> [Location service]
                              |
                              v
                          [Geohash index]
                              |
[Client] <-- "nearby friends" -- [Query]
```

### Location updates
- Background: every 10-30 seconds.
- Or on movement (more than 50m).

### Geohash
- Encode lat/long as string.
- Neighbors share prefixes.
- Query: friends in same / nearby geohash.

### Privacy
- Opt-in only.
- Approximate location (round geohash).
- Friends-of-friends only.

### Real-time
- WebSocket push when friend enters range.

### Key takeaway
Nearby friends = location updates + geohash index + spatial query + WebSocket push. Opt-in
privacy. Approximate location (geohash precision) for privacy.
