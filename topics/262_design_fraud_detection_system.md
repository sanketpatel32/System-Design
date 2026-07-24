# Design Fraud Detection System

> **Category:** Analytics and Data Pipelines

---

A Fraud Detection System analyzes financial transactions, account signups, and user activities in real time to intercept fraudulent behaviors, account takeovers, and payment exploits.

### System Requirements
- **Functional Requirements**:
  - Evaluate transaction events against static deterministic rules and dynamic ML models.
  - Provide real-time decisions (ALLOW, CHALLENGE/MFA, BLOCK) within $< 50	ext{ ms}$.
  - Support fraud syndicate graph analysis to uncover linked malicious accounts.
- **Non-Functional Requirements**:
  - Ultra-Low Latency: In-line payment decisioning must not degrade checkout user experience.
  - High Precision & Recall: Minimize false positives to avoid blocking legitimate customers.
  - Adaptability: Rapidly update rules and retrain ML models as fraud patterns evolve.

### System Architecture
```
[ Checkout / Payment API ] ---> [ Event Streaming Queue (Kafka) ]
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
[ In-Line Rule Engine (Drools) ]                                   [ Feature Store (Feast/Redis) ]
(Immediate Hard Limits & Checks)                                   (Aggregated Velocity Profiles)
        |                                                                   |
        +---------------------------------+---------------------------------+
                                          |
                                          v
                              [ Machine Learning Engine ]
                              (XGBoost / Graph Neural Nets)
                                          |
                                          v
                              [ Decision Router ] ---> [ Action: ALLOW / MFA / BLOCK ]
                                          |
                                          v
                              [ Graph DB (Neo4j) ]
                              (Syndicate Pattern Matching)
```

### Detection Strategy Comparison
| Mechanism | Evaluation Speed | Strengths | Limitations |
|---|---|---|---|
| **Deterministic Rules** | $< 5	ext{ ms}$ | Immediate enforcement of hard velocity limits (e.g. max 3 cards/hr). | Easily evaded once fraudsters deduce rule thresholds. |
| **Machine Learning (XGBoost)** | $15-30	ext{ ms}$ | Catches complex non-linear feature interactions and subtle anomalies. | Requires frequent retraining to combat model drift. |
| **Graph DB (Neo4j)** | Async ($100-500	ext{ ms}$) | Uncovers shared IP, device ID, or bank account linkages across accounts. | High computational cost for deep graph traversals. |

### Key takeaway
Effective fraud detection systems blend synchronous low-latency rule evaluation and ML feature store lookups with asynchronous deep graph analysis to catch both known transaction exploits and novel syndicate rings.
