# Design Location Sharing System

> **Category:** Location Based Systems

---

Design a system where users share their real-time location with friends (e.g. Life360).

### Requirements
- **Functional**: share location with circle; see on map; history.
- **Non-functional**: low-latency updates; privacy.

### Architecture
```
[User location] -> [Location service] -> [Redis (latest)]
                                       -> [DB (history)]
                                       -> [WebSocket push to circle]
```

### Location updates
- App reports every 10-60 seconds.
- Or significant movement.

### Circles
- Group of users sharing with each other.
- Members see each other's latest location.

### Storage
- **Redis**: latest location per user (fast reads).
- **DB**: history for playback.

### Real-time
- WebSocket to each member of a circle.
- Push when location updates.

### Privacy
- Per-circle opt-in.
- Pause sharing.

### Key takeaway
Location sharing = location updates → Redis (latest) + DB (history) → WebSocket push to circle
members. Per-circle opt-in privacy. Real-time via persistent WebSocket connections.
