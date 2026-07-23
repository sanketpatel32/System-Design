# Disaster Recovery

> **Category:** Reliability and Fault Tolerance

---

Disaster recovery (DR) = **plans and infrastructure to recover from a major failure** —
region outage, data center loss, ransomware, human error.

### Why
- Region outages happen (AWS us-east-1 has gone down multiple times).
- Data loss happens (accidental deletion, bug).
- Ransomware / breaches.
- Compliance often requires DR plans.

### Key metrics
| Metric | Meaning |
|--------|---------|
| **RPO** (Recovery Point Objective) | How much data can you lose? (e.g. 5 min) |
| **RTO** (Recovery Time Objective) | How long until you're back? (e.g. 1 hour) |
| **DR RTO** | Time to switch to DR site |

### Strategies (in order of cost)
1. **Backup only**: restore from backup. RPO/RTO in hours.
2. **Pilot light**: minimal infra in DR region; scale up on failover. RTO 10s of minutes.
3. **Warm standby**: smaller replica of production in DR region. RTO minutes.
4. **Multi-site active-active**: full traffic in multiple regions. RTO ~0.

### Components of DR
- **Backups**: regular, tested, off-region.
- **Replication**: DB + object storage to DR region.
- **Infrastructure as Code**: recreate everything from templates.
- **DNS failover**: Route53 health checks, automatic.
- **Runbooks**: documented procedures.
- **Tests**: chaos engineering, game days.

### Common failures to plan for
- **Region outage** (multi-region).
- **AZ outage** (multi-AZ).
- **Data corruption** (point-in-time recovery).
- **Ransomware** (immutable backups).
- **Bug deploy** (rollback, feature flags).
- **DDoS** (CDN, autoscale).

### Testing
- **Game days**: deliberately fail things.
- **Restore drills**: restore backups regularly, verify.
- **Failover tests**: switch to DR region quarterly.

### Key takeaway
Define RPO/RTO, then choose strategy (pilot light, warm standby, multi-site). Replicate data,
automate infra via IaC, document runbooks, and TEST your DR plan regularly — untested DR is
just hope.
