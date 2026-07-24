# Design Multiplayer Game Backend

> **Category:** Real-Time Systems

---

A Real-Time Multiplayer Game Backend manages player matchmaking, room allocation, high-frequency game state synchronization (60 Hz ticks), and anti-cheat enforcement for action games.

### System Requirements
- **Functional Requirements**:
  - Matchmaking system based on ELO/Skill-Based Matchmaking (SBMM) and latency.
  - Dedicate high-performance game server instances per match session.
  - Low-latency real-time state sync (player positions, actions, health).
- **Non-Functional Requirements**:
  - Sub-30ms Latency: Ultra-fast UDP networking with client-side prediction and lag compensation.
  - High Tick Rate: Support 60–128 Hz simulation tick updates per dedicated server.
  - Scalability: Orchestrate containerized game servers (Agones) dynamically.

### System Architecture
```
[ Game Client ] ---> [ Matchmaking API ] ---> [ Agones Game Server Manager ]
       |                                                    |
       | (Direct UDP Connection)                            v
       +----------------------------------> [ Dedicated Game Server ]
                                            (60 Hz Simulation Loop)
                                                    |
                                                    v
                                         [ Redis Game State Cache ]
                                                    |
                                                    v
                                         [ Persistent Player DB ]
```

### Protocol & Synchronization Mechanics
| Protocol / Technique | Implementation Detail | Purpose |
|---|---|---|
| **UDP Transport** | Unreliable/Fast transport with custom packet ACK | Bypasses TCP head-of-line blocking for real-time movement packets. |
| **Client Prediction** | Client simulates local inputs immediately before server ACK | Eliminates perceived movement lag for local player. |
| **Lag Compensation** | Server rewinds world state to player's timestamp during hit checks | Ensures accurate shooting registration despite network latency. |

### Key takeaway
Multiplayer game backends use UDP networking, client-side prediction, and server rewind lag compensation executed on dedicated 60 Hz game servers (Agones) to deliver seamless real-time gameplay.
