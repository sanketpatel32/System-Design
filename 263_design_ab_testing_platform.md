# Design A/B Testing Platform

> **Category:** Data Intensive Systems

---

Design a platform to run A/B tests: split users into variants, measure outcomes.

### Requirements
- **Functional**: define experiments; assign users; track metrics; significance.
- **Non-functional**: consistent assignment; accurate metrics.

### Architecture
```
[Client] -> [SDK] -> bucket user -> variant
                       |
                       v
                  [Assignment service]
                  [Event tracking]
                  [Analysis]
```

### Assignment
- Hash(user_id + experiment_id) % 100 → bucket.
- Sticky: same user → same variant.
- Mutually exclusive tests (layers).

### Metrics
- **Primary**: the metric you're testing (conversion).
- **Guardrails**: don't break existing metrics.
- Compute lift + statistical significance.

### Analysis
- Compare variants' metric distributions.
- T-test / sequential testing.
- Segment analysis (does it help mobile but hurt desktop?).

### Pitfalls
- **Sample ratio mismatch**: 50/50 split becomes 51/49 → bug.
- **Multiple comparisons**: too many metrics → false positives.
- **Interaction effects**: overlapping tests.

### Key takeaway
A/B testing = consistent bucketing (hash user ID) + event tracking + significance testing.
Watch for SRM, multiple comparisons. Guardrail metrics prevent regressions.
