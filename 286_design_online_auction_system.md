# Design Online Auction System

> **Category:** Real-Time Systems

---

Design eBay-style auction system.

### Requirements
- **Functional**: list items; bid; real-time updates; auto-bid; settle.
- **Non-functional**: low-latency bid updates; prevent bid sniping.

### Architecture
```
[Bidder] -> [API] -> [Bid service]
                       [Real-time pub/sub]
                       [Auction end scheduler]
```

### Bid flow
1. Bidder submits bid.
2. Validate (higher than current).
3. Store bid.
4. Broadcast new bid via WebSocket.
5. Other bidders see update.

### Anti-sniping
- Auction extends by N minutes if a bid comes in near end.

### Auto-bid
- User sets max.
- System auto-bids up to max in increments.

### Auction end
- Scheduler triggers at end time.
- Highest bidder wins.
- Notifications.

### Concurrency
- Multiple bids simultaneously.
- Atomic update: `UPDATE auctions SET current_bid = X WHERE id = Y AND current_bid < X`.

### Key takeaway
Auction system = bid service + real-time WebSocket broadcast + scheduler for auction end + atomic
bid updates (prevent race). Anti-sniping extends auction on late bids.
