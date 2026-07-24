# Disaster Recovery

> **Category:** Reliability and Fault Tolerance

---

Disaster Recovery (DR) is the set of **policies, tools, and procedures designed to enable the recovery or continuation of vital technology infrastructure** following a catastrophic event (such as a regional cloud outage, datacenter flood, fiber cut, or ransomware attack).

### Disaster Recovery Metrics: RPO and RTO

DR planning is defined by two primary quantitative metrics: Recovery Point Objective (RPO) and Recovery Time Objective (RTO).

```
Timeline of a Disaster Event:
====================================================================================================>
                 Last Data Backup                        DISASTER STRIKES!               Services Restored
                        |                                       |                                |
                        |<------------- RPO ------------------->|<------------ RTO ------------->|
                        |    (Data Lost During Outage)          |    (Downtime Duration)         |

- RPO (Recovery Point Objective): Maximum acceptable data loss duration (e.g. 5 minutes of lost writes).
- RTO (Recovery Time Objective): Maximum acceptable downtime before services are restored (e.g. 1 hour downtime).
```

### Disaster Recovery Architectural Strategies Matrix

| Strategy | Cost | RPO | RTO | Mechanics |
| :--- | :--- | :--- | :--- | :--- |
| **Backup and Restore** | Lowest | Hours to Days | Hours to Days | Restore cold backups to fresh infrastructure upon disaster |
| **Pilot Light** | Low | Minutes to Hours | Tens of Minutes | Core DB continuously replicated; compute scaled up on failure |
| **Warm Standby** | Moderate | Seconds to Minutes | Minutes | Scaled-down shadow stack running continuously in secondary region |
| **Hot Site / Active-Active**| Highest | Sub-second (~0) | Sub-second (~0) | Fully live infrastructure processing traffic in 2+ regions concurrently |

### Key Disaster Recovery Drills & Automation

1. **Automated Cross-Region Replication**: Asynchronously replicate database WAL logs and S3 object buckets across geographically separated regions.
2. **Chaos Engineering & Game Days**: Regularly execute simulated region failover drills to verify that DNS failovers, database promotions, and backup restorations work under real pressure.

### Key Trade-offs & Financial Constraints

- Lowering RPO/RTO targets towards zero exponentially increases infrastructure costs.
- Align DR strategy with business impact: critical payment systems justify Active-Active, while non-critical internal analytics tolerate Backup & Restore.
### DR Game Day Verification Checklist

1. **Simulate Region Outage**: Blackhole cross-region network interfaces to mimic AWS region death.
2. **Verify DNS Failover**: Ensure Route 53 Health Checks flip traffic within 60 seconds.
3. **Verify Database Promotion**: Test automated promotion of read replicas to primary writers.
4. **Data Loss Audit**: Compare transaction IDs to quantify exact RPO data loss during failover.
### Quantifying RPO and RTO in SLA Architecture

```python
# System Design RPO and RTO Metric Calculation Framework
def calculate_disaster_impact(backup_frequency_sec, restoration_time_sec, revenue_per_sec):
    rpo_data_loss_sec = backup_frequency_sec
    rto_downtime_sec = restoration_time_sec
    total_financial_loss = (rpo_data_loss_sec + rto_downtime_sec) * revenue_per_sec
    
    return {
        "max_rpo_seconds": rpo_data_loss_sec,
        "max_rto_seconds": rto_downtime_sec,
        "estimated_financial_impact_usd": total_financial_loss
    }

# Example: Hourly Backups (3600s RPO) + 2-Hour Restore (7200s RTO) at $100/sec revenue
print(calculate_disaster_impact(3600, 7200, 100))
# Output: Estimated Financial Impact: $1,080,000 USD
```

### Multi-Region Disaster Recovery Failure Walkthrough

1. **Regional Outage Trigger**: Datacenter primary region (`us-east-1`) suffers a catastrophic power grid failure.
2. **Health Check Probes**: Route 53 / Anycast DNS probes detect 3 consecutive failed HTTP health checks across 15 seconds.
3. **Automated Failover Signal**: Route 53 updates DNS A-records to point to secondary standby region (`us-west-2`).
4. **Database Primary Promotion**: Patroni / Aurora Global Database promotes the read replica in `us-west-2` to writable Primary status within 45 seconds.

### Key takeaway

Disaster Recovery plans are defined by **RPO (acceptable data loss) and RTO (acceptable downtime)**, spanning strategies from cold Backup & Restore to multi-region Active-Active setups.
