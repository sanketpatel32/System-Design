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
| `retain(n)` | Advances cursor position by n characters | Preserves existing text untouched. |
| `insert(str)`| Inserts string `str` at current cursor index | Expands document length. |
| `delete(n)` | Deletes n characters at current cursor index | Contracts document length. |

### Versioning & Snapshot Mechanics
- **Client versioning**: each operation carries the client's last-seen server version; the server transforms the op against everything newer before broadcasting — clients that lag apply transformed ops without full reloads.
- **Snapshot cadence**: folding millions of ops is too slow for cold opens, so snapshots checkpoint every N ops; a document opens against the latest snapshot plus the tail of the log.
- **Revision history**: named milestones are just pinned log positions — "see changes since Monday" plays the ops between two positions, the same machinery that powers suggestion mode (suggestions are ops in a parallel proposed layer).

### Comments & Suggestions
Comments anchor to text ranges, not character indexes — anchors use the op-log position and re-derive their range as the document evolves (a comment survives text inserted before it). Suggestion mode runs the same OT pipeline but tags ops as *proposed*; accepting a suggestion replays its ops into the main layer.

### Operational Realities
| Concern | Design Response |
|---|---|
| **Offline editing** | Local op queue with Lamport clocks; on reconnect, replay through the OT server for ordering. |
| **Massive docs** | Pagination of the editor buffer; the server only materializes visible ranges plus index checkpoints. |
| **Google-scale fan-out** | A doc's collaborators are few (tens), so a single collaboration server per document suffices; the gateway layer routes by doc ID. |
| **Failover mid-session** | Clients reconnect with their last-acked version; the new server resumes from the snapshot + log — no edit is lost. |

### Key takeaway
Google Docs uses centralized Operational Transformation (OT) servers over WebSockets to sequence edit operations (`retain`, `insert`, `delete`), snapshotting document states into Bigtable.
