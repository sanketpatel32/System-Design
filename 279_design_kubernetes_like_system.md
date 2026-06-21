# Design Kubernetes Like System

> **Category:** Advanced System Design Problems

---

Design a container orchestration system like Kubernetes.

### Requirements
- **Functional**: schedule containers; scale; heal; network; rolling updates.
- **Non-functional**: HA; self-healing; declarative.

### Architecture
```
[Control plane]
  - API server
  - Scheduler
  - Controller manager
  - etcd (state)
[Worker nodes]
  - kubelet
  - kube-proxy
  - container runtime
```

### Control plane
- **API server**: entry point, validates, persists to etcd.
- **Scheduler**: assigns pods to nodes.
- **Controllers**: reconcile loop (desired → actual).
- **etcd**: source of truth (strongly consistent).

### Worker nodes
- **kubelet**: manages pods on node.
- **kube-proxy**: networking (services).
- **Container runtime** (containerd).

### Reconciliation loop
```
desired = read from etcd
actual = current state
if desired != actual:
    take action to converge
```

### Scheduling
- Filter nodes (resources, taints, affinity).
- Score remaining nodes.
- Bind pod to best node.

### Self-healing
- Pod dies → controller restarts.
- Node dies → reschedule pods.

### Service discovery
- Services (virtual IP).
- DNS.
- Load balancing.

### Rolling updates
- New ReplicaSet ramps up; old ramps down.

### Key takeaway
K8s = control plane (API server + scheduler + controllers + etcd) + workers (kubelet + proxy +
runtime). Declarative: declare desired state; controllers reconcile continuously. etcd is the
source of truth.
