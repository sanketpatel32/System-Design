# Quorum

> **Category:** Distributed Systems

---

A quorum is the **minimum number of nodes in a distributed cluster that must participate in and agree on an operation** for that operation to be considered valid and committed. Quorum voting enforces strong consistency across distributed reads and writes without requiring every node in the cluster to respond.

### Quorum Read/Write Math Architecture

In a cluster of N nodes, configuring Read Quorum (R) and Write Quorum (W) such that R + W > N guarantees that the read set and write set overlap on at least one node containing the latest version of data.

```
Total Nodes N = 5 (Nodes 1, 2, 3, 4, 5)

Write Operation (W = 3):
Client writes to Nodes 1, 2, 3 ---> SUCCESS (3 of 5 nodes acknowledged write)
+----------------+ +----------------+ +----------------+ +----------------+ +----------------+
| Node 1 (v2)    | | Node 2 (v2)    | | Node 3 (v2)    | | Node 4 (v1)    | | Node 5 (v1)    |
+----------------+ +----------------+ +----------------+ +----------------+ +----------------+

Read Operation (R = 3):
Client reads from Nodes 3, 4, 5 ---> SUCCESS (Overlap detected on Node 3!)
Node 3 returns v2, Nodes 4 & 5 return v1 -> Client selects latest timestamp version (v2)!

Quorum Condition Satisfied: R (3) + W (3) = 6 > N (5) -> Strong Consistency Guaranteed!
```

### Quorum Configuration Matrix

| Quorum Trade-off Profile | Write Quorum (W) | Read Quorum (R) | Consistency Guarantee | System Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **Write-Heavy Optimization** | W = 1 | R = N | Strong (1 + N > N) | Fast writes, slow reads (Read must query all nodes) |
| **Read-Heavy Optimization** | W = N | R = 1 | Strong (N + 1 > N) | Fast reads, slow writes (Write must update all nodes) |
| **Balanced Quorum (Standard)**| W = ⌊N/2⌋ + 1 | R = ⌊N/2⌋ + 1 | Strong | Balanced read/write performance & fault tolerance |
| **Eventual Consistency** | W = 1 | R = 1 | Eventual (1 + 1 ≤ N) | High performance, risk of stale reads |

### Fault Tolerance Calculations

For a cluster of N nodes using majority quorum (Q = ⌊N/2⌋ + 1):
- **Fault Tolerance**: The system can tolerate up to F = ⌊(N − 1) / 2⌋ node failures.
- An odd number of nodes is optimal: A 5-node cluster tolerates 2 node failures (5 - 3 = 2). A 6-node cluster also tolerates only 2 failures (6 - 4 = 2), adding node cost without increasing fault tolerance.

### Key Trade-offs & Production Engineering

- ✅ **Tunable Consistency**: Allows system designers to tune R and W dynamically based on read-to-write ratio requirements.
- ✅ **Fault Tolerant Operation**: High availability is maintained even when minority nodes crash or experience network partitions.
- ❌ **Network Overhead**: Issuing concurrent read/write requests to R or W nodes increases internal network traffic.
### Quorum Calculation & Read Repair Flow

```python
def evaluate_quorum(total_nodes, write_ack_count, read_ack_count):
    majority = (total_nodes // 2) + 1
    strong_consistency = (write_ack_count + read_ack_count) > total_nodes
    
    return {
        "majority_quorum": majority,
        "is_write_successful": write_ack_count >= majority,
        "is_read_successful": read_ack_count >= majority,
        "guarantees_strong_consistency": strong_consistency
    }

# Example 5-node cluster (N=5, W=3, R=3)
print(evaluate_quorum(5, 3, 3))
# Output: {'majority_quorum': 3, 'guarantees_strong_consistency': True}
```

### Sloppy Quorums vs Strict Quorums

- **Strict Quorum**: Reads and writes require responses from the designated primary partition nodes assigned to the key hash.
- **Sloppy Quorum & Hinted Handoff**: If primary partition nodes are offline during a network partition, writes are accepted by healthy non-primary nodes. Once the primary nodes recover, "hints" are handed back. (Provides higher availability at the expense of temporary consistency).

### Key takeaway

Quorum rules (R + W > N) guarantee **strong data consistency across distributed reads and writes** by ensuring that read and write node sets overlap on at least one up-to-date node.
