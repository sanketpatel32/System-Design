# Circuit Breaker

> **Category:** Reliability and Fault Tolerance

---

The Circuit Breaker pattern is a stability mechanism that **detects downstream service failures and prevents applications from repeatedly trying to execute operations doomed to fail**. It acts as an automatic switch: when downstream error rates cross a failure threshold, the circuit breaker opens, immediately failing fast without burdening the failing service.

### Circuit Breaker State Machine Architecture

The circuit breaker transitions through three primary states: Closed (normal), Open (failing fast), and Half-Open (probing recovery).

```
                     +-----------------------------------------+
                     |                 CLOSED                  |
                     | - Normal Operation                      |
                     | - Routes requests downstream            |
                     | - Tracks Error Rate Thresholds          |
                     +-----------------------------------------+
                                      |
                       Error Rate > 50% Threshold Exceeded!
                                      v
                     +-----------------------------------------+
                     |                  OPEN                   |
                     | - FAILS FAST Immediately!               |
                     | - Returns Fallback / 503 Error          |
                     | - Zero traffic routed to Downstream     |
                     +-----------------------------------------+
                                      |
                         Sleep Window TTL Expires (30s)
                                      v
                     +-----------------------------------------+
                     |                HALF-OPEN                |
                     | - Allows trial probe requests (e.g. 5%) |
                     | - Evaluates success of probe calls      |
                     +-----------------------------------------+
                          /                               Probe Calls Fail /                         \ Probe Calls Succeed!
                        v                           v
                 Re-open Circuit!              Reset to CLOSED!
```

### Circuit Breaker States Reference Matrix

| State | Request Action | Downstream Traffic | Transition Trigger |
| :--- | :--- | :--- | :--- |
| **CLOSED** | Passes through normally | 100% Traffic routed | Failure rate exceeds threshold → Transitions to **OPEN** |
| **OPEN** | Fails fast immediately (Fallback response) | 0% Traffic routed | Sleep TTL timer elapses → Transitions to **HALF-OPEN** |
| **HALF-OPEN**| Sends limited probe trial requests | Bounded trial traffic (e.g. 5%) | Probe succeeds → **CLOSED**; Probe fails → **OPEN** |

### Key Configuration Parameters

- **Rolling Sliding Window**: Number of requests or seconds over which error rates are evaluated (e.g. last 100 requests).
- **Failure Rate Threshold**: Percentage of failed or timed-out requests that open the circuit (e.g. > 50% failures).
- **Wait Duration in Open State**: Time the circuit remains Open before switching to Half-Open (e.g. 30 seconds).

### Key Trade-offs & Production Guidance

- ✅ **Fails Fast & Protects Thread Pools**: Returns instant fallback responses instead of tying up worker threads for full timeout durations.
- ✅ **Gives Failing Services Room to Recover**: Halting traffic prevents struggling downstream databases from being overwhelmed.
- ❌ **Requires Fallback Strategies**: Systems must define sensible fallback responses (e.g. returning cached recommendation lists or default values).

### Key takeaway

Circuit breakers **prevent cascading failures by tripping to an OPEN state during downstream outages**, failing fast to free caller threads while giving failing services time to recover.
