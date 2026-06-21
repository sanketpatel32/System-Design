# Estimate Daily Active Users

> **Category:** Back-of-the-Envelope Estimation

---

DAU (Daily Active Users) is the starting number for almost every capacity estimate — QPS,
storage, bandwidth, server count all derive from it.

### How to estimate
- **Bottom-up**: count from population — "1B smartphone users in target market, 30% are in our
  demographic, 50% adoption → 300M MAU → ~30% open daily → 90M DAU."
- **Top-down from press releases**: "Company X reported 250M DAU."
- **From device/geo**: population × internet penetration × target segment.

### Sanity check rules of thumb
| Product | Typical DAU |
|---------|-------------|
| WhatsApp | ~2B (huge) |
| Instagram | ~1B |
| Twitter/X | ~250M |
| Uber rides/day | ~15M |
| Netflix streams | ~200M |
| A typical startup | 10k–1M |

### Once you have DAU
```
MAU  ≈ DAU × 2.5   (industry average)
WAU  ≈ DAU × 1.5
Peak concurrent ≈ DAU × 10%   (peak hour)
Peak QPS ≈ peak concurrent × avg actions/min / 60
```

### Example
Twitter: 250M DAU, avg 5 tweets/day/user → 1.25B tweets/day. Spread over 16 active hours:
~22k tweets/sec average, ~3x at peak → ~65k tweets/sec peak.

### Key takeaway
DAU is the anchor. Every other estimate — RPS, storage, cost — multiplies from it. Get the DAU
range right (order of magnitude), and the rest follows.
