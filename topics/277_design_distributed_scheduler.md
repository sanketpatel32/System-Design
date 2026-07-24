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

### Key takeaway
Distributed job schedulers use in-memory Hashed Wheel Timers or Redis Sorted Sets keyed by execution timestamps to trigger jobs accurately, decoupling scheduling leaders from worker execution pools via message queues.
