# Disaster Recovery

> **Category:** Reliability and Fault Tolerance

---

Disaster Recovery (DR) comprises the architecture, policies, and procedures designed to **restore critical infrastructure and data services** following catastrophic events (e.g. regional cloud outages, natural disasters, or major cyberattacks).

### Disaster Recovery RTO vs RPO Metrics

```
+-----------------------------------------------------------------------------------+
| Timeline of a Catastrophic Outage Event                                          |
+-----------------------------------------------------------------------------------+

     Last Backup Snapshot                          Disaster Strikes              Data & Services Fully Restored
--------------+-------------------------------------------+------------------------------------+------------> Time
              |<------------ RPO Window ------------->|   |<----------- RTO Window ----------->|
              |       (Max Tolerable Data Loss)           |       (Max Downtime Duration)      |
```

### DR Strategies Matrix

| Strategy | RTO (Recovery Time) | RPO (Data Loss) | Cost | Architecture Description |
| :--- | :--- | :--- | :--- | :--- |
| **Backup & Restore** | Hours to Days | Hours to 24 Hours | Lowest | Cold S3/Glacier storage dumps restored on fresh compute |
| **Pilot Light** | 10 - 30 Minutes | Minutes | Low | DB core continuously replicated; app compute scaled to zero |
| **Warm Standby** | 1 - 5 Minutes | Seconds to Minutes | Medium | Scaled-down shadow infrastructure running in secondary region |
| **Active-Active Hot Site**| Sub-Second / Instant| Near Zero | Highest | Full multi-region live-live cluster with global DNS routing |

### Key Disaster Recovery Metrics

- **Recovery Point Objective (RPO)**: Maximum acceptable age of unrecovered data lost during an outage (e.g., RPO = 5 minutes means up to 5 minutes of data loss is acceptable).
- **Recovery Time Objective (RTO)**: Maximum acceptable clock duration the system can remain offline before business disruption limits are exceeded (e.g., RTO = 1 hour).

### Key takeaway

Align disaster recovery strategies to business requirements by balancing **RTO (downtime target) and RPO (data loss target)** against multi-region infrastructure costs.
