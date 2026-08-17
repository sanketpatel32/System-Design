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

### Interest Management & Scale
- **Area of Interest (AOI)**: a player only receives state for entities near them — grid- or cell-based subscription cuts outbound traffic from O(players) to O(nearby players), the difference between 100 and 10,000 concurrent players per zone.
- **Authoritative server, always**: the client predicts, but the server's simulation is the truth — clients submit *inputs*, not positions, so speed-hack teleports are impossible by construction.
- **Snapshot delta compression**: broadcast only changed entity fields per tick plus periodic full keyframes (for joiners and loss recovery) — a full-world snapshot every tick would saturate any link.

### Matchmaking Design
| Concern | Approach |
|---|---|
| **Skill buckets** | Quantize ELO into brackets (±100) so the candidate pool per query stays large. |
| **Wait-time widening** | Expand acceptable skill/latency ranges as queue time grows — waiting 5 minutes for a "perfect" match is worse than a slightly lopsided one. |
| **Group vs solo fairness** | Pre-compute party weighted-MMR; premades face premades where pool allows. |
| **Backfill** | Allow joining matches in progress (with spawn protection) to keep sessions full. |

### Anti-Cheat Layers
1. **Deterministic simulation validation**: server replays inputs; divergent client claims (impossible reaction times, physics violations) are rejected server-side.
2. **Statistical detection**: headshot accuracy, snap-angle distributions, and resource acquisition rates flagged by offline models — ban in waves, not instantly, to avoid revealing detection thresholds.
3. **Server-side secrets**: loot rolls, fog-of-war state, and AI decisions never leave the server.

### Key takeaway
Multiplayer game backends use UDP networking, client-side prediction, and server rewind lag compensation executed on dedicated 60 Hz game servers (Agones) to deliver seamless real-time gameplay.
