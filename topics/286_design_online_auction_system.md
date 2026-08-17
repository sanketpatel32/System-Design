# Design Online Auction System

> **Category:** Real-Time Systems

---

An Online Auction System (e.g. eBay live auctions) manages real-time bidding, item countdown timers, reserve prices, and instant leaderboards while guaranteeing strict bid ordering.

### System Requirements
- **Functional Requirements**:
  - Accept user bids with atomic verification against current highest bid.
  - Real-time broadcast of highest bid and winner updates to all active participants.
  - Support automatic proxy bidding (auto-bidding up to user limit).
- **Non-Functional Requirements**:
  - Strict Serialization: Zero race conditions when multiple users bid simultaneously on the same item.
  - Low Latency: Sub-50ms bid processing and broadcast.
  - High Reliability: Durable audit logs of every placed bid.

### System Architecture
```
[ Bidders Mobile App ] ---> [ Auction Gateway ]
                                   |
                                   v
                    [ Atomic Bid Processing Engine ]
                    (Redis Lua Script / In-Memory Lock)
                                   |
        +--------------------------+--------------------------+
        |                                                     |
        v                                                     v
[ Redis Leaderboard & State ]                         [ Bid DB (PostgreSQL) ]
(Current Max Bid & Winner ID)                         (Immutable Bid Audit Log)
        |                                                     |
        +--------------------------+--------------------------+
                                   |
                                   v
                    [ WebSocket Broadcast Cluster ]
                    (Pushes New Max Bid to Bidders)
```

### Atomic Redis Lua Bid Verification
```lua
local auction_key = KEYS[1]
local new_bid = tonumber(ARGV[1])
local bidder_id = ARGV[2]

local current_bid = tonumber(redis.call('HGET', auction_key, 'max_bid') or '0')
if new_bid > current_bid then
    redis.call('HSET', auction_key, 'max_bid', new_bid, 'winner_id', bidder_id)
    return 1
else
    return 0
end
```

### Auction Close & Sniper Defense
- **Soft-close extension**: any bid in the final 60 seconds extends the auction by 30 seconds — this is how eBay neutralizes last-second sniping bots and maximizes final prices.
- **Close authority**: only the bid engine that owns the item's auction state may declare the winner; a delayed in-flight bid that arrives after close is rejected with a clear "auction ended" event (the audit log records the attempt).
- **Settlement flow**: winner notification → payment hold → escrow → seller payout, each step a durable state machine so a crash mid-settlement resumes rather than double-charges.

### Proxy (Auto) Bidding Mechanics
The system bids the *minimum increment* on the proxy user's behalf, not their maximum:

1. Reserve price ₹100, current bid ₹120. A user sets a proxy max of ₹200.
2. The engine places ₹125 (current + increment) on their behalf and holds the ₹200 limit privately.
3. A rival's ₹150 arrives → engine instantly counters ₹155 from the proxy — still below the hidden ceiling.
4. Rivals keep raising until someone exceeds ₹200; the proxy stops and the auction continues manually.

Invariant: the visible bid is always `min(winner's hidden max, runner-up + increment)` — the reason proxy auctions feel like a live auctioneer.

### Failure Modes
| Failure | Consequence | Mitigation |
| :--- | :--- | :--- |
| Redis failover mid-auction | State loss / double winners | Persist bid log synchronously (the audit log *is* the recovery source); rebuild auction state by replay. |
| WebSocket disconnect | Bidder blind to new max | Reconnect with Last-Event-ID resume + full state resync on join. |
| Flash bid storm at close | Queue backlog delays close | Shed *reads* first; bid writes are strictly serialized per item — latency budget protects them. |

### Key takeaway
Online auction systems enforce atomic bid ordering via Redis Lua scripts, broadcasting updated highest bids to connected participants over WebSockets while logging immutable bid history in relational storage.
