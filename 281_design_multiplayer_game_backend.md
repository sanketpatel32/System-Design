# Design Multiplayer Game Backend

> **Category:** Real-Time Systems

---

Design backend for a real-time multiplayer game.

### Requirements
- **Functional**: real-time game state sync; matchmaking; leaderboards; chat.
- **Non-functional**: <100ms latency; cheat detection.

### Architecture
```
[Players] <-UDP-> [Game servers (authoritative)]
                    [Matchmaking service]
                    [Leaderboard service]
                    [Chat]
```

### Authoritative server
- Game server holds the truth.
- Clients send inputs; server simulates; broadcasts state.
- Prevents client-side cheating.

### UDP for real-time
- Lower latency than TCP.
- Tolerates packet loss (use client-side interpolation).
- Reliable UDP for important events (your framework handles).

### Matchmaking
- Skill-based (ELO/MMR).
- Region preference.
- Wait time / skill trade-off.

### State synchronization
- **Snapshot**: server sends full state periodically.
- **Delta**: only changes.
- **Client-side prediction**: predict locally, reconcile with server.

### Leaderboards
- Redis sorted sets (`ZADD`).

### Scaling
- Per-match: dedicated game server (DGS).
- Agones (K8s for games) manages DGS lifecycle.

### Key takeaway
Multiplayer game = authoritative game servers (UDP) + matchmaking (skill) + client-side
prediction. Per-match dedicated server. Agones manages DGS on K8s. Redis for leaderboards.
