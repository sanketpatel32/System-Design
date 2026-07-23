# Graceful Degradation

> **Category:** Reliability and Fault Tolerance

---

Graceful degradation = **when something fails, return partial / degraded results instead of
crashing.** Keep the user working, even if not perfectly.

### Why
- Failures are inevitable.
- A blank error page is worse than a working app with one missing feature.
- Users prefer "slow but works" to "broken."

### Examples
| Failure | Degrade to |
|---------|-----------|
| Recommendation service down | Show popular items instead |
| Personalization down | Show generic content |
| Search index stale | Show results with "might be outdated" note |
| Chat service slow | Show cached messages, disable new sends |
| Payment gateway down | Show "try again later," allow cart save |
| Image CDN slow | Show placeholder |

### Implementation
- **Feature flags**: disable a feature at runtime.
- **Fallbacks**: cached data, defaults, simpler logic.
- **Try-catch around non-critical calls**: log + continue.
- **Async paths**: skip if queue is full.
- **Circuit breakers + fallback functions**.

### Identify critical vs non-critical
- **Critical path**: must work (checkout, payment, auth).
- **Non-critical**: nice-to-have (recommendations, comments, ads).
- Critical → fail loudly if broken.
- Non-critical → degrade silently.

### Example pattern
```python
def get_homepage(user):
    core = get_user_data(user)              # must succeed
    try:
        recommendations = get_recs(user)
    except ServiceDown:
        recommendations = get_popular()      # fallback
    try:
        notifications = get_notifications(user)
    except ServiceDown:
        notifications = []                   # empty is fine
    return render(core, recommendations, notifications)
```

### Trade-offs
- ✅ Better UX during outages.
- ✅ Higher availability (in user perception).
- ❌ More code paths.
- ❌ Harder to test.
- ❌ May mask underlying failures.

### Key takeaway
Identify critical vs non-critical paths. Critical must work; non-critical can degrade (cache,
default, omit). Wrap non-critical calls in try/catch with sensible fallbacks. Use feature flags
to disable broken features at runtime.
