# Chaos Testing

> **Category:** Reliability and Fault Tolerance

---

Chaos engineering = **deliberately injecting failures** into production to verify the system
behaves as expected.

### Why
- Production failures are inevitable.
- Untested failure modes will surprise you.
- Better to find weaknesses during business hours than at 3am.
- Builds confidence in resilience.

### What to test
- Kill an instance.
- Kill a DB primary (force failover).
- Disconnect an AZ.
- Add network latency.
- Drop packets between services.
- Fill up a disk.
- Expire a cert.
- Disable a downstream service.

### Principles
1. **Hypothesis**: "killing one web server won't affect users."
2. **Blast radius**: start small (one instance), expand gradually.
3. **Monitor**: watch metrics during the test.
4. **Abort**: roll back if things break unexpectedly.
5. **Automate**: schedule regular chaos tests (game days).

### Tools
- **Netflix Chaos Monkey** (random instance termination).
- **Gremlin** (managed chaos engineering).
- **Chaos Mesh** (Kubernetes-native).
- **AWS Fault Injection Service**.

### Process
1. Identify critical user flows.
2. Define steady-state metrics (e.g. error rate < 0.1%).
3. Hypothesize: "if I kill X, metrics stay normal."
4. Inject failure.
5. Observe.
6. If abnormal: investigate, fix, re-test.
7. If normal: increase blast radius.

### When NOT to do chaos
- On untested systems (break things first in staging).
- During business-critical events (Black Friday).
- Without monitoring (you won't know what broke).

### Game days
- Scheduled exercises where team deliberately breaks things.
- Practice incident response.
- Find documentation gaps.

### Key takeaway
Chaos engineering finds the failure modes your tests miss. Start with small blast radius in
business hours, monitor, automate. Game days build team muscle for real incidents. Don't do
chaos without monitoring — you won't know what broke.
