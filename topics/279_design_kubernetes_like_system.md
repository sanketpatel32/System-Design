# Design Kubernetes Like System

> **Category:** Advanced System Design Problems

---

A Container Orchestration System (like Kubernetes) automates deployment, scaling, health monitoring, and networking of containerized workloads across a cluster of worker nodes.

### System Requirements
- **Functional Requirements**:
  - Declarative API spec management (`Pod`, `Deployment`, `Service`).
  - Automated container scheduling based on resource constraints (CPU/RAM).
  - Self-healing: Automatically restart crashed containers and reschedule dead node workloads.
- **Non-Functional Requirements**:
  - High Availability: Control plane fault tolerance with distributed consensus (etcd).
  - Scalability: Manage thousands of worker nodes and tens of thousands of container pods.
  - High Reliability: Zero downtime rolling updates for application services.

### System Architecture
```
                                [ CONTROL PLANE ]
[ kubectl / Client ] ---> [ API Server (REST) ] <---> [ etcd (Consensus Store) ]
                                   |
           +-----------------------+-----------------------+
           |                                               |
           v                                               v
[ Scheduler Engine ]                            [ Controller Manager ]
(Resource Matching)                             (Reconcile State Loops)
           |                                               |
  +--------+-----------------------------------------------+--------+
  | (gRPC Control Channel)                                          |
  v                                                                 v
[ WORKER NODE 1 ]                                               [ WORKER NODE 2 ]
  +-> [ Kubelet Agent ]                                           +-> [ Kubelet Agent ]
  +-> [ Container Runtime (containerd) ]                         +-> [ Container Runtime (containerd) ]
  +-> [ Kube-Proxy (iptables/eBPF) ]                             +-> [ Kube-Proxy (iptables/eBPF) ]
```

### Control Plane vs Worker Node Components
| Component | Location | Role |
|---|---|---|
| **API Server** | Control Plane | Central REST gateway; authenticates and validates all resource specs. |
| **etcd** | Control Plane | Consistent, highly available key-value store holding total cluster state. |
| **Scheduler** | Control Plane | Selects optimal worker node for unscheduled pods based on resource specs. |
| **Controller Manager** | Control Plane | Runs reconciliation loops ensuring actual state matches desired state. |
| **Kubelet** | Worker Node | Node agent ensuring containers declared in PodSpecs are running and healthy. |
| **Kube-Proxy** | Worker Node | Manages host network rules (iptables/eBPF) for pod-to-pod routing. |

### Key takeaway
Kubernetes-like orchestrators use a declarative control plane backed by etcd consensus, employing control loops (Controller Manager) and node agents (Kubelet) to reconcile actual cluster state against desired state.
