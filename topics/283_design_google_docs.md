# Design Google Docs

> **Category:** Real-Time Systems

---

See **#282 Design Collaborative Document Editor**.

### Google Docs-specific
- Uses **OT** (Operational Transformation), not CRDTs historically.
- More recently: hybrid approaches.
- Massive scale (millions of concurrent edits).

### Architecture
- WebSocket per user.
- Document state on collaboration server.
- Periodic snapshots.

### Key takeaway
Google Docs = collaborative editor (OT historically) + WebSocket + massive scale + snapshotting.
Real-time, conflict-free, with offline support via op log replay.
