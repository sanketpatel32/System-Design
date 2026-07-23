# Active-Active Architecture

> **Category:** Reliability and Fault Tolerance

---

Active-active = **multiple regions/instances all serve traffic simultaneously.** No single
"primary"; users go to the nearest healthy region.

### Topology
```
[Region 1] <----> [Region 2]
   ^                    ^
   |                    |
[Users in US]      [Users in EU]
```

### Why
- **Zero RTO**: if one region dies, others continue serving.
- **Low global latency**: users hit nearest region.
- **Capacity**: combined throughput of multiple regions.
- **Better resource utilization** (no idle standby).

### Challenges
- **Data replication**: writes in multiple regions must sync.
- **Conflict resolution**: same record updated in two regions.
- **Routing**: get each user to the right region.
- **Cost**: full duplication.

### Data strategies

#### Single-writer multi-reader
- One region is the writer; others serve reads.
- Simpler, but write latency for non-primary users.

#### Multi-writer with partitioning
- Each region owns certain users / data ranges.
- No conflicts within a partition.

#### Multi-writer with conflict resolution
- Any region accepts writes; conflicts resolved via:
  - **LWW** (timestamp).
  - **CRDTs** (automatic merge).
  - **Vector clocks + app merge**.
  - **Spanner-style consensus** (TrueTime + Paxos).

### Routing
- **Geo-DNS**: user location → nearest region.
- **Latency-based routing**: Route53 picks lowest latency.
- **Anycast**: same IP advertised from multiple regions.

### Real-world
- **Netflix**: active-active across AWS regions.
- **Cloudflare**: anycast edge.
- **Google Spanner**: globally consistent active-active.

### Trade-offs
- ✅ Zero RTO.
- ✅ Low latency globally.
- ✅ No wasted capacity.
- ❌ Conflict resolution complexity.
- ❌ Higher cost (full duplication).
- ❌ Operational complexity.

### Key takeaway
Active-active is the **gold standard** for global low-latency HA. Solves RTO completely.
Trade-off: data conflict resolution is hard. Use partitioning (per-region data ownership) or
consensus-based systems (Spanner) to make it tractable.
