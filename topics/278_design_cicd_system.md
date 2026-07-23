# Design CI/CD System

> **Category:** Advanced System Design Problems

---

Design a CI/CD system: build, test, deploy on every commit.

### Requirements
- **Functional**: trigger on commit; build; test; deploy to environments.
- **Non-functional**: fast; observable; reliable.

### Architecture
```
[Git push] -> [Webhook] -> [CI orchestrator]
                            |
                            v
                         [Build agents] -> [Artifacts]
                         [Test runners]
                         [Deploy stage]
```

### Pipeline stages
1. **Build**: compile, package.
2. **Test**: unit, integration, e2e.
3. **Package**: Docker image, etc.
4. **Deploy staging**.
5. **Acceptance**.
6. **Deploy prod** (with approval).

### Orchestrator
- Jenkins, GitLab CI, GitHub Actions, Argo Workflows.
- DAG of jobs.

### Runners
- Ephemeral containers/VMs per job.
- Isolated.

### Artifacts
- Docker registry.
- Versioned.

### Deployment strategies
- **Blue-green**: two envs, switch.
- **Canary**: gradual rollout.
- **Rolling**: replace instances one by one.

### Observability
- Pipeline dashboards.
- Failure alerts.
- Deployment metrics.

### Key takeaway
CI/CD = webhook → orchestrator (DAG of jobs) → ephemeral runners → artifacts → deploy.
Blue-green / canary / rolling for safety. Observability on pipeline + deployments.
