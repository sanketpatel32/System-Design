# Design Dropbox

> **Category:** Intermediate System Design Problems

---

See **#223 Design Google Drive** for similar design.

### Dropbox-specific
- Pioneered block-level sync.
- Delta sync: only changed blocks.
- LAN sync (devices on same network sync directly).

### Architecture
- Same: client + sync service + block storage + metadata DB.

### Key takeaway
Dropbox = Google Drive-style block sync. Delta sync minimizes bandwidth. Same core design.
