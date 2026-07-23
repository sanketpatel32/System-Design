# Design Zoom

> **Category:** Intermediate System Design Problems

---

Design Zoom: video conferencing for many participants.

### Requirements
- **Functional**: video/audio calls; screen share; recording; chat.
- **Non-functional**: low-latency (<500ms one-way); scale to 100s of participants.

### Architecture
```
[Participants] <-WebRTC-> [Media servers (SFU)]
                            |
                            v
                       [Recording service]
                       [Signaling server]
```

### WebRTC
- P2P for small calls (2-4 participants).
- **SFU (Selective Forwarding Unit)** for larger: each participant sends once, server forwards
  to others.
- **MCU** (multi-point control unit): server mixes (rare, expensive).

### Signaling
- WebSocket for call setup (join, leave, negotiate).
- After setup, media flows over UDP/WebRTC.

### Scaling
- One media server per N participants.
- Spread across regions (closest to users).
- Recording: server captures stream → S3.

### Adaptive quality
- Client adjusts bitrate based on bandwidth.
- Server sends multiple layers (simulcast).

### Key takeaway
Zoom = WebRTC + SFU media servers + signaling over WebSocket. P2P for small, SFU for large.
Recording via server-side capture. Simulcast for adaptive quality.
