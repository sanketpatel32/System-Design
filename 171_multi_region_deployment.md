# Multi-Region Deployment

> **Category:** Reliability and Fault Tolerance

---

Multi-region deployment = **running your service in multiple geographic regions** for
disaster recovery and low global latency.

### Why
- **Disaster recovery**: region outages happen.
- **Latency**: users in India shouldn't wait 200ms for Virginia.
- **Data sovereignty**: EU data must stay in EU.
- **Capacity**: spread load.

### Patterns

#### Active-Passive
- Primary region serves all traffic.
- Secondary replicates data, stands ready.
- On failure: DNS failover to secondary.
- RTO: minutes to hours.

#### Active-Active
- Both regions serve traffic.
- Users routed to nearest (geo DNS).
- Data synced between regions.
- RTO: ~0.

#### Pilot Light
- Minimal infra in DR region.
- Data replicated.
- Scale up on failover.

### Challenges
- **Data replication**: cross-region bandwidth, latency, consistency.
- **Conflict resolution**: writes in two regions.
- **Routing**: get users to the right region.
- **Cost**: 2x infrastructure.
- **Testing**: failover must be drilled.

### Data strategies
- **Single-region writes**: only primary accepts writes; replicas in other regions (avoids
  conflicts, but no geo-write latency).
- **Multi-region writes**: each region accepts writes; conflict resolution needed (CRDTs, LWW,
  Spanner).
- **Active-Active with partitioning**: each region owns certain users/data (no conflicts).

### Routing
- **GeoDNS**: route by user location.
- **Latency-based routing**: Route53 picks lowest-latency region.
- **Health-check failover**: Route53 detects outage, switches DNS.

### Real-world
- **Netflix**: active-active across multiple AWS regions.
- **Cloudflare**: 300+ edge locations.
- **Banks**: often single-region for regulatory reasons.

### Key takeaway
Multi-region deployment is the only way to survive a region outage. Choose **active-passive**
(simpler, higher RTO) or **active-active** (zero RTO, complex). Solve data replication
(conflicts, consistency) deliberately. Always drill failover.
