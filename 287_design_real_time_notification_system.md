# Design Real-Time Notification System

> **Category:** Real-Time Systems

---

See **#206 Design Notification System**.

### Real-time-specific
- Push to connected devices immediately.
- WebSocket / SSE / push (mobile).

### Architecture
```
[Trigger] -> [Notification service] -> [Channel router]
                                        [WebSocket (web)]
                                        [APNs/FCM (mobile)]
                                        [Email (SES)]
```

### In-app
- WebSocket per device.
- Push events to connected sessions.

### Mobile push
- APNs (iOS), FCM (Android).
- Works even when app closed.

### Key takeaway
Real-time notifications = service + per-channel router (WebSocket in-app, APNs/FCM mobile,
SES email). Push immediately; queue for retries on failure.
