# Design A/B Testing Platform

> **Category:** Analytics and Data Pipelines

---

An A/B Testing and Experimentation Platform enables product teams to run concurrent feature experiments, dynamically assign users to variant buckets, and evaluate statistical significance on business metrics.

### System Requirements
- **Functional Requirements**:
  - Deterministically map users to experiment variants (Control vs Treatment).
  - Support multi-layer experiments (running overlapping, independent tests without bias).
  - Collect impression and conversion telemetry to compute statistical significance.
- **Non-Functional Requirements**:
  - Zero Latency Impact: Local SDK evaluation without synchronous remote network calls.
  - Deterministic Uniformity: Consistent variant assignment across web, mobile, and server sessions.
  - Statistical Rigor: Guard against Sample Ratio Mismatch (SRM) and p-hacking.

### System Architecture
```
[ Experiment Management UI ] ---> [ Experiment Rule Publisher ] ---> [ Edge CDN / Local SDK ]
                                                                             |
                                                                             v
[ User Mobile App ] -----------------------------------------> [ Hash Variant Evaluator ]
                                                               (MurmurHash3 Bucketing)
                                                                             |
                                                                             v
[ Impression Telemetry Stream (Kafka) ] <----------------------- [ Log Variant Assignment ]
                 |
                 v
[ Statistical Evaluation Engine (Spark/ClickHouse) ] ---> [ Real-Time Experiment Dashboard ]
```

### Bucketing & Layering Mechanism
Variants are calculated deterministically using salt hashing:
**bucket** = MurmurHash3(user\ᵢd + experiment_salt) ±od 100

| Experiment Design | Implementation | Use Case |
|---|---|---|
| **Single Layer Split** | Divide 100% user base into mutually exclusive slices | Major UI overhauls or risky backend changes. |
| **Overlapping Layers** | Re-hash user ID with layer-specific salts | Run UI test, search rank test, and pricing test simultaneously on same user base. |
| **Sequential Testing** | Continuous p-value monitoring (e.g. mSPRT) | Stop winning/failing tests early without inflating Type I error rates. |

### Key takeaway
A/B testing platforms use deterministic salted hashing (MurmurHash3) within edge SDKs for instant variant evaluation, piping impression streams to statistical pipeline engines for real-time significance calculation.
