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

### Key takeaway
Online auction systems enforce atomic bid ordering via Redis Lua scripts, broadcasting updated highest bids to connected participants over WebSockets while logging immutable bid history in relational storage.
