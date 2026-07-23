# Design Distributed Scheduler

> **Category:** Advanced System Design Problems

---

Design a distributed job scheduler (like Kubernetes CronJobs, Airflow).

### Requirements
- **Functional**: schedule jobs (cron, one-time); execute on workers; retries; dependencies.
- **Non-functional**: HA; no double-execution.

### Architecture
```
[Scheduler leaders] -> [Job queue] -> [Workers]
   (leader election)
```

### Leader election
- Only one scheduler active (avoid double-execution).
- Raft / ZK lock.
- Standby takes over on failure.

### Job storage
- DB: job definitions, schedules, history.
- Queue: pending jobs.

### Worker pool
- Workers pull jobs from queue.
- Report status.
- Autoscale.

### Cron
- Parse cron expressions.
- Scheduler triggers at next time.

### At-least-once
- Job may execute more than once on failure.
- Jobs must be idempotent.

### Dependencies
- DAG of tasks.
- Run after dependencies succeed.
- Airflow-style.

### Key takeaway
Distributed scheduler = leader election (avoid double-exec) + job queue + worker pool.
At-least-once execution → jobs must be idempotent. DAG support for dependencies (Airflow).
