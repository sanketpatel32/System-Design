# Design Slack

> **Category:** Intermediate System Design Problems

---

Design Slack: team chat, channels, threads, search, notifications.

### Requirements
- **Functional**: channels; DMs; threads; files; search; notifications.
- **Non-functional**: real-time; full-text search; multi-device sync.

### Architecture
```
[Client] <-WebSocket-> [Slack Gateway]
                       [Channel service]
                       [Search service (ES)]
                       [Notification service]
                       [File service (S3)]
```

### Channels
- Members of a channel receive messages.
- Per-channel message history.

### Threads
- Replies nested under a parent message.
- Materialized path for thread retrieval.

### Search
- **Elasticsearch** indexes all messages.
- Search within team / channel.

### Notifications
- Push for @mentions, DMs.
- Email digest for offline.

### Multi-device
- Per-device cursors (last read message).
- Sync state across devices.

### Architecture details
- Each team isolated (multi-tenant).
- WebSocket per connected device.
- Messages fanned out to channel members via pub/sub.

### Key takeaway
Slack = channels + threads + WebSockets + full-text search (ES) + multi-device cursor sync.
Multi-tenant (per-team isolation). Notifications for @mentions and DMs.
