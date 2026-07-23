# Design Ad Click Tracking System

> **Category:** Search and Recommendation Systems

---

Design a system to track ad impressions and clicks for billing + analytics.

### Requirements
- **Functional**: record impressions, clicks; aggregate; bill advertisers.
- **Non-functional**: high write throughput; accurate; real-time dashboards.

### Architecture
```
[Browser] -> pixel (impressions) -> [Collector] -> [Kafka] -> [Aggregator]
        -> click redirect -> [Collector]                          |
                                                                 v
                                                          [Time-series DB]
                                                          [Reporting DB]
```

### Impression tracking
- Pixel / beacon in ad.
- POST to collector on render.

### Click tracking
- Click → redirect URL.
- Server logs click, then redirects.

### Aggregation
- Count per (advertiser, campaign, ad) per minute/hour/day.
- Stream processing (Flink).

### Billing
- Per impression (CPM) or per click (CPC).
- Join clicks + impressions + spend rate.

### Real-time
- Clicks stream in.
- Sub-minute dashboards.

### Key takeaway
Ad tracking = pixel (impressions) + redirect (clicks) → Kafka → aggregator → dashboards +
billing. Stream processing for real-time aggregations. Per-campaign/per-ad granularity.
