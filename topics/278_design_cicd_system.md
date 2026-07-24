# Design CI/CD System

> **Category:** Advanced System Design Problems

---

A Continuous Integration and Continuous Deployment (CI/CD) system automates software compilation, testing, artifact packaging, and environment deployment on code commits.

### System Requirements
- **Functional Requirements**:
  - Ingest VCS code commit webhooks (GitHub, GitLab).
  - Parse pipeline definitions (`.yaml`) and execute multi-stage DAG build steps.
  - Provision ephemeral build execution environments (containers/VMs).
  - Deploy artifacts via Blue-Green or Canary strategies.
- **Non-Functional Requirements**:
  - High Isolation: Multi-tenant container isolation to prevent security cross-contamination.
  - Scalability: Scale ephemeral build worker pools dynamically based on queue depth.
  - Fast Feedback: Low latency execution via build step caching (Docker layer caching).

### System Architecture
```
[ VCS Webhook (GitHub) ] ---> [ CI/CD Control Plane ] ---> [ Pipeline DAG Engine ]
                                                                   |
                                 +---------------------------------+---------------------------------+
                                 |                                                                   |
                                 v                                                                   v
                     [ Dynamic Worker Pool Manager ]                                     [ Artifact Registry ]
                     (Ephemeral K8s Pods / VMs)                                          (Docker Images / Binaries)
                                 |                                                                   |
                                 +---------------------------------+---------------------------------+
                                                                   |
                                                                   v
                                                       [ Deployment Controller ]
                                                       (Canary / Blue-Green Rollouts)
```

### Deployment Strategy Matrix
| Deployment Strategy | Execution Mechanism | Downtime | Rollback Speed |
|---|---|---|---|
| **Rolling Update** | Replaces old instances with new ones incrementally | Zero downtime | Slower (requires step-by-step reverse deployment). |
| **Blue-Green** | Maintains 2 identical environments; router switches $100\%$ traffic instantly | Zero downtime | Instant (switch router back to Blue). |
| **Canary** | Routes $1-5\%$ traffic to new version; evaluates error rate before full rollout | Zero downtime | Instant (shift traffic percentage back to $0\%$). |

### Key takeaway
CI/CD systems decouple control plane pipeline orchestration from isolated ephemeral worker pools (K8s pods), leveraging artifact registries and Canary/Blue-Green deployment controllers to deliver zero-downtime code rollouts.
