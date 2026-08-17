# Reliability

> **Category:** System Design Basics

---

Reliability is the **probability that a system will perform its intended function correctly, without failure, under specified operating conditions over a given period**.

While **availability** measures whether a system is up, **reliability** measures whether the system returns accurate results correctly and predictably without producing silent failures or corrupted data.

### Resilience and Fallback Pattern Topology

```
+-------------------------------------------------------------------------+
|                    CIRCUIT BREAKER & RESILIENCE FLOW                    |
+-------------------------------------------------------------------------+
                                    
  [ Client Request ] ---> [ API Gateway / Service ]
                                   |
                         +---------+---------+
                         | Circuit Breaker   |
                         | State: CLOSED     |
                         +---------+---------+
                                   |
                  +----------------+----------------+
                  | (Success)                       | (Failure / Timeout)
                  v                                 v
        [ Primary Database ]              [ Fallback Cache / Queue ]
        Returns Real-Time Data            Returns Stale Data / Queues Work
```

### Reliability vs. Availability

| Dimension | Availability | Reliability |
| :--- | :--- | :--- |
| **Core Question** | Is the system reachable when requested? | Does the system produce correct and expected results? |
| **Primary Metric** | % Uptime (e.g., 99.99%) | Mean Time Between Failures (MTBF), Error Rate (<0.001%) |
| **Failure Scenario** | Server drops HTTP connections (503 Service Unavailable). | Server returns HTTP 200 OK but with corrupted data payloads. |
| **Engineering Focus** | Redundancy, failover nodes, multi-region deployments. | Transactions, idempotent retries, validation, error handling. |

### Core Architectural Strategies for High Reliability

1. **Redundancy & Replication**: Run multiple redundant instances of services and replicate data synchronously or asynchronously to prevent data loss.
2. **Circuit Breakers**: Prevent cascading failure by short-circuiting downstream calls when a dependent service degrades (e.g., Hystrix / Resilience4j pattern).
3. **Idempotent Operations**: Ensure duplicate requests (caused by network retries) produce identical state without duplicate transactions.
4. **Graceful Degradation**: Fall back to degraded functionality instead of failing completely (e.g., show cached recommendations if real-time recommendation engine times out).
5. **Chaos Engineering**: Inject deliberate faults (e.g., Chaos Monkey) into staging and production to test system self-healing capabilities proactively.

### Metrics Measuring System Reliability

- **MTBF (Mean Time Between Failures)**: Average operational time between hardware or software system crashes.
- **MTTR (Mean Time To Repair)**: Average duration required to diagnose, patch, and recover from a failure.
- **Error Rate**: Percentage of processed operations resulting in unhandled exceptions or 5xx server responses.

### Key takeaway

A system can be **available without being reliable** if it serves corrupted data or intermittent errors. Reliability requires rigorous error handling, circuit breakers, transaction boundaries, idempotent retry mechanisms, and continuous chaos testing.
