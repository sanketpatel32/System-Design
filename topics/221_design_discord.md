# Design Discord

> **Category:** Intermediate System Design Problems

---

Design Discord: voice + text chat for communities (servers, channels).

### Requirements
- **Functional**: servers, text channels, voice channels, DMs, presence.
- **Non-functional**: low-latency voice (<500ms); massive concurrent connections.

### Architecture
```
[Client] <-WebSocket-> [Gateway] (text, presence)
         <-UDP/WebRTC-> [Voice server] (audio)
```

### Voice
- **WebRTC / UDP** for low-latency audio.
- Server mixes audio for groups (or client-side SFU).
- Voice regions per channel.

### Text
- WebSocket for messages.
- Per-channel history.

### Servers (guilds)
- Group of users + channels + roles.
- Roles → permissions.

### Presence
- Online/idle/DND/offline per user.
- Real-time updates via WebSocket.

### Scaling
- Each gateway handles ~50k connections.
- Voice servers separate (CPU-bound for mixing).
- Redis for cross-instance pub/sub.

### Key takeaway
Discord = WebSocket (text/presence) + WebRTC/UDP (voice) + servers (guilds) + roles for
permissions. Voice needs dedicated servers (CPU-bound mixing). Per-guild isolation.
