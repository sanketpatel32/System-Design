# Design Collaborative Document Editor

> **Category:** Real-Time Systems

---

A Collaborative Document Editor allows multiple users to edit the same rich-text document simultaneously, resolving edit conflicts in real time while displaying cursor locations and revision history.

### System Requirements
- **Functional Requirements**:
  - Multi-user real-time concurrent text editing.
  - Display live collaborator cursors and selection highlights.
  - Maintain complete version revision history with restore capability.
- **Non-Functional Requirements**:
  - Convergence: All users must see identical document states after edits settle.
  - Sub-50ms Latency: Instant local text updates with async server convergence.
  - Partition Tolerance: Support offline editing with automatic reconciliation on reconnect.

### System Architecture
```
[ Client Editor A ] <---> [ WebSocket Gateway ] <---> [ Client Editor B ]
                                |
                                v
                   [ Collaboration Engine Node ]
                   (OT / CRDT Convergence Server)
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
[ Document Snapshot DB ]                       [ Operation Log Store ]
(PostgreSQL / DynamoDB)                        (Append-Only Change History)
```

### Concurrency Resolution: OT vs CRDT
| Criteria | Operational Transformation (OT) | Conflict-Free Replicated Data Types (CRDT) |
|---|---|---|
| **Approach** | Transforms operation indexes relative to concurrent ops | Data structure embeds unique IDs for every character |
| **Centralization** | Requires central server to order operations | Peer-to-peer / Decentralized friendly |
| **Memory Overhead**| Low (plain text + small transform log) | High (overhead per character ID metadata) |
| **P2P Offline Use** | Difficult | Exceptional |

### Key takeaway
Collaborative document editors achieve real-time convergence using Operational Transformation (OT) with central ordering servers or CRDT structures for decentralized offline-first editing.
