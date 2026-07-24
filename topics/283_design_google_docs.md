# Design Google Docs

> **Category:** Real-Time Systems

---

Google Docs is a cloud-based collaborative document editor supporting real-time multi-user editing, rich text formatting, comments, and revision histories.

### System Requirements
- **Functional Requirements**:
  - Concurrent collaborative document editing using Operational Transformation (OT).
  - Real-time presence, cursor position tracking, and user selection highlights.
  - Automatic version snapshotting and revision history playback.
- **Non-Functional Requirements**:
  - High Availability: 99.999% uptime for cloud document access.
  - Strict Convergence: Zero document corruption or character ordering divergence.
  - Sub-100ms End-to-End Edit Latency globally.

### System Architecture
```
[ Browser Client A ] <--- WebSockets ---> [ Google Docs Gateway ] <--- WebSockets ---> [ Browser Client B ]
                                                    |
                                                    v
                                       [ Centralized OT Server ]
                                       (Operation Transform & Log)
                                                    |
             +--------------------------------------+--------------------------------------+
             |                                                                             |
             v                                                                             v
[ Doc Snapshot Storage (Bigtable) ]                                       [ Presence Broker (Redis) ]
(Periodic Full Document State)                                            (Live Cursors & Viewers)
```

### OT Operation Schema & Types
Every edit operation is represented as a sequence of basic primitives:

```json
{
  "doc_id": "doc_789",
  "client_version": 142,
  "ops": [
    {"retain": 15},
    {"insert": "hello "},
    {"delete": 3}
  ]
}
```

| Operation Primitive | Description | Action |
|---|---|---|
| `retain(n)` | Advances cursor position by $n$ characters | Preserves existing text untouched. |
| `insert(str)`| Inserts string `str` at current cursor index | Expands document length. |
| `delete(n)` | Deletes $n$ characters at current cursor index | Contracts document length. |

### Key takeaway
Google Docs uses centralized Operational Transformation (OT) servers over WebSockets to sequence edit operations (`retain`, `insert`, `delete`), snapshotting document states into Bigtable.
