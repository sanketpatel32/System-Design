# Design Distributed Scheduler

> **Category:** Advanced System Design Problems

---

A Distributed Job Scheduler manages, schedules, and executes millions of time-based (cron) and one-time delayed tasks across a pool of distributed worker nodes.

### System Requirements
- **Functional Requirements**:
  - Schedule jobs using Cron expressions or specific execution timestamps.
  - Guarantee at-least-once job execution with automatic retries on failure.
  - Support job dependency DAGs (Directed Acyclic Graphs).
- **Non-Functional Requirements**:
  - High Precision: Execute scheduled jobs within milliseconds of designated target execution time.
  - Scalability: Support millions of scheduled jobs concurrently.
  - Fault Tolerance: Active master election prevents split-brain duplicate job triggers.

### System Architecture
```
[ User / Service ] ---> [ Scheduler API Gateway ] ---> [ Job Database (PostgreSQL) ]
                                                                 |
                                                                 v
                                                 [ Leader Scheduler Master ]
                                                 (Distributed Lock / Zookeeper)
                                                                 |
                                                                 v
                                                 [ Hashed Wheel Timer Engine ]
                                                                 |
                                                                 v
                                                 [ Worker Execution Queue (Kafka) ]
                                                                 |
                                                                 v
                                                 [ Worker Node Pool ]
```

### Time-Trigger Mechanisms & Worker Dispatch
| Mechanism | Technical Implementation | Scalability & Latency |
|---|---|---|
| **Database Polling** | `SELECT * FROM jobs WHERE execute_at <= NOW() AND status = 'PENDING'` | Slower; DB lock contention under millions of jobs. |
| **Hashed Wheel Timer** | In-memory circular buffer with time slots | Sub-millisecond precision; highly efficient memory footprint for millions of timers. |
| **Hierarchical Delay Queue** | Redis Sorted Set (`ZADD` with score = timestamp) | High performance; workers poll `ZRANGEBYSCORE`. |

### Exactly-Once-Trigger Guarantee
Duplicate job *triggering* — not duplicate execution — is what the scheduler must prevent:
- **Leader fencing**: only the current lock/lease holder (ZooKeeper, or a fencing-token lock like Chubby/etcd) fires due jobs; a stale leader's triggers carry an outdated epoch and are rejected by workers.
- **Claim-then-dispatch**: transitioning a job `PENDING → TRIGGERED` is a compare-and-swap; a second scheduler that wakes late sees the state change and skips it.
- **Visibility timeout on the worker queue**: if a worker dies mid-execution, the job reappears — at-least-once execution plus idempotent job bodies (or dedup by `job_run_id`) yield effectively-once outcomes.

### Missed-Job Recovery & Clock Discipline
- **Catch-up policy**: after a scheduler outage, jobs that came due while down must fire (missed-schedule policy: run-once, run-all, or skip — configurable per job; billing jobs run-all, report emails run-once).
- **Clock skew**: never trust worker clocks for due-time comparisons — the scheduler's monotonic view (or NTP-disciplined DB time) decides, and TTL windows absorb small skews.
- **DAG dependencies**: a job fires only when all parents recorded success; failed parents cascade-skip dependents, with manual retry breaking the skip state.

### Multi-Tenancy & Backpressure
| Concern | Design |
|---|---|
| **Noisy tenant** | Per-tenant worker-slot quotas and fair-share queues so one tenant's 100k jobs can't starve others. |
| **Burst absorption** | The Kafka dispatch queue decouples trigger precision from execution capacity; execution lag is monitored separately from schedule lag. |
| **Long-running jobs** | Heartbeated leases (not fixed timeouts) so 2-hour jobs aren't redelivered mid-run. |
| **Observability** | Track per-job `scheduled_at → triggered_at → started_at → finished_at`; SLO on trigger lag, alert on queue age. |

### Key takeaway
Distributed job schedulers use in-memory Hashed Wheel Timers or Redis Sorted Sets keyed by execution timestamps to trigger jobs accurately, decoupling scheduling leaders from worker execution pools via message queues.
