# Graceful Degradation

> **Category:** Reliability and Fault Tolerance

---

Graceful degradation is a design strategy where a system, when experiencing severe load or component failures, **intentionally disables non-critical features while keeping core functions operational**. Instead of suffering a total system outage, the system degrades its functionality to maintain baseline service availability.

### Graceful Degradation Architecture

During extreme traffic spikes or backend outages, non-critical microservices are bypassed, serving degraded fallbacks or cached defaults.

```
Normal Full-Feature Mode:
Client Request ---> API Gateway ---> Order Service + Recommendation Service + Personalization API
                                    (All 3 Services Return Data -> Rich UI Rendered)

Graceful Degradation Mode (Under Heavy Surge / Recommendation Outage):
Client Request ---> API Gateway ---> Order Service (CRITICAL - Processed Normally!)
                                \--> Recommendation Service (BYPASSED / Degraded!)
                                     Returns static fallback: "Popular Items List" (from Redis Cache)

Result: User can still complete purchase! Non-critical widget falls back gracefully!
```

### Degradation Strategies Reference Matrix

| Feature Tier | Normal Behavior | Degraded Behavior Under Stress | Benefit / Impact |
| :--- | :--- | :--- | :--- |
| **Product Search** | Personalized ML-ranked search results | Fallback to basic keyword search index | Bypasses heavy ML inference model latency |
| **E-Commerce Home**| Live personalized user recommendations | Serve static cached "Trending Deals" list | Eliminates thousands of complex database queries |
| **Comments / Reviews**| Live read/write comments stream | Hide comments widget entirely or serve read-only | Saves DB write IOPS for checkout flow |
| **Image Resolution**| High-density uncompressed media | Serve compressed low-res WebP images | Reduces network bandwidth consumption |

### Automated Feature Flags & Shedding

- **Feature Flags / Toggles**: Operators use dynamic configuration flags (e.g. LaunchDarkly) to turn off heavy non-essential UI components instantly during outages.
- **Load Shedding**: When CPU exceeds 90%, API gateways drop low-priority traffic (e.g. background analytics logging) with `429` or `503` responses while passing high-priority checkout traffic.

### Key Trade-offs & Design Principles

- ✅ **Preserves Core Business Revenue**: Ensures core conversion funnels (checkout, payment) remain online.
- ❌ **Requires Careful Feature Tiering**: Products must be explicitly architected into critical vs non-critical dependencies ahead of time.
### Dynamic Degradation Feature Toggle Code Example

```python
def get_user_dashboard(user_id):
    dashboard_data = {
        "user_profile": user_service.get_profile(user_id) # CRITICAL
    }
    
    # Degrade feature gracefully if circuit breaker is open or feature flag disabled
    if feature_flags.is_enabled("recommendations_widget") and not rec_circuit_breaker.is_open():
        dashboard_data["recommendations"] = rec_service.get_personalized(user_id)
    else:
        # Fallback to static cached trending list
        dashboard_data["recommendations"] = redis_cache.get("static_trending_items")
        dashboard_data["is_degraded"] = True

    return dashboard_data
```

### Key takeaway

Graceful degradation maintains core system availability during outages by **bypassing non-critical features and serving cached or simplified fallbacks**.
