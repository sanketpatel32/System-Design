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

### How OT Convergence Works (Mini Example)
User A inserts `"X"` at index 3 while user B concurrently inserts `"Y"` at index 5. The server orders A first, then transforms B's operation against A's: B's insert index shifts to 6. Both clients apply the same transformed sequence, so both converge to the identical string — the invariant is that every site applies *some equivalent permutation* of the same operations.

CRDTs sidestep transformation entirely: every character carries a unique position identifier (`(userId, clock)`, often a fractional-indexing tree), and inserts merge deterministically at any site without a coordinator — the cost is per-character metadata and tombstones for deletes.

### Presence & Awareness Channel
Cursors, selections, and name labels are not document state — they're ephemeral awareness data on a separate lightweight channel: broadcast-only (never persisted), rate-limited to ~20 Hz, and trivially droppable on congestion. Mixing presence into the OT/CRDT pipeline is a classic over-engineering mistake that bloats the operation log.

### Persistence & History
- **Append-only operation log**: edits are durable events; document state is a materialized fold of the log — enabling replay, audit, and time-travel views ("restore to version 42" = truncate or branch the log).
- **Periodic snapshots**: fold the log into snapshot checkpoints every N operations so opening a document doesn't replay millions of ops.
- **Offline mode**: queue local operations with client-generated Lamport clocks; on reconnect, replay through the convergence server (OT) or merge directly (CRDT) — conflict resolution falls out of the same machinery.

### Key takeaway
Collaborative document editors achieve real-time convergence using Operational Transformation (OT) with central ordering servers or CRDT structures for decentralized offline-first editing.
