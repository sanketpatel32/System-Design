# Design Collaborative Document Editor

> **Category:** Real-Time Systems

---

Design Google Docs-like collaborative editing.

### Requirements
- **Functional**: multiple users edit same doc; real-time sync; cursor positions.
- **Non-functional**: low-latency; conflict-free.

### Conflict resolution

#### Operational Transformation (OT)
- Old approach.
- Transform concurrent ops to maintain consistency.
- Complex to implement correctly.

#### CRDTs (Conflict-free Replicated Data Types)
- Modern approach (Yjs, Automerge).
- Operations commute (apply in any order → same result).
- Automatic conflict resolution.

### Architecture
```
[Editor] <-WebSocket-> [Collaboration server]
                        [Document state (CRDT)]
                        [Persistence]
```

### CRDT approach
- Each edit transformed into CRDT operation.
- Sent to server, broadcast to others.
- Each client applies locally.
- Convergent by design.

### Cursor presence
- Broadcast cursor position.
- Show other users' cursors.

### History
- Snapshot periodically.
- Replay CRDT ops for full history.

### Offline
- CRDTs support offline editing (sync on reconnect).

### Key takeaway
Collaborative editing = **CRDTs** (Yjs, Automerge) for automatic conflict-free merges, or OT for
classic approach. WebSocket for real-time broadcast. Each edit is a commutative operation.
