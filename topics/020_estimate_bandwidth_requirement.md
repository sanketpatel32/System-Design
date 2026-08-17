# Estimate Bandwidth Requirement

> **Category:** Back-of-the-Envelope Estimation

---

Estimating **Bandwidth Requirements** quantifies the network throughput entering (**Ingress**) and exiting (**Egress**) a data center. Bandwidth estimates determine hardware NIC capacity, CDN provisioning, and monthly cloud network egress bills.

### Ingress vs. Egress Network Topology

```
+-------------------------------------------------------------------------+
|                  INGRESS AND EGRESS BANDWIDTH FLOW                      |
+-------------------------------------------------------------------------+

  [ Clients / Mobile Apps ]
      |                ^
      | Ingress        | Egress
      | (Uploads)      | (Downloads/Streams)
      v                |
  +-----------------------------------------------------------------------+
  | API GATEWAY / EDGE CDN NETWORK                                        |
  +-----------------------------------------------------------------------+
      |                ^
      v                |
  [ Ingress Bandwidth ]  [ Egress Bandwidth ]
  (e.g., 5 Gbps In)    (e.g., 50 Gbps Out - Read Heavy 10:1 Ratio)
```

### Bytes to Bits Network Conversion Reference

Network bandwidth is expressed in **bits per second (bps, Mbps, Gbps)**, while data storage is measured in **Bytes (B, MB, GB)**.

1 Byte (B) = 8 bits (b)

| Storage Unit | Network Bandwidth Equivalent (8×) | Example Scenario |
| :--- | :--- | :--- |
| **1 MB/s (Megabyte/sec)** | **8 Mbps (Megabits/sec)** | Low-bitrate 1080p video stream |
| **125 MB/s** | **1 Gbps (Gigabit/sec)** | Standard 1 Gbps NIC line saturation |
| **1.25 GB/s** | **10 Gbps** | High-density rack switch backbone |
| **12.5 GB/s** | **100 Gbps** | Datacenter core router link |

### Step-by-Step Bandwidth Calculation Walkthrough

1. **Given System Requirements**:
   - **Video Streaming Service** (e.g., YouTube subset):
   - Daily active streams = 10 Million daily video plays.
   - Average video size = 50 MB.
   - Read:Write ratio is highly egress-heavy (100:1).

2. **Calculate Daily Egress Volume**:

**Daily Egress Data** = 10 M videos × 50 MB = 500,000,000 MB = 500 TB/day

3. **Calculate Average Egress Bandwidth**:
   - Divide by 86,400 seconds (approx 100,000):

**Average Egress Data Rate** = 500 TB / 100,000 sec = 0.005 TB/sec = 5 GB/sec

4. **Convert Bytes to Bits for Network Sizing**:

**Average Egress Bandwidth** = 5 GB/sec × 8 bits / Byte = 40 Gbps (Gigabits per second)

5. **Calculate Peak Egress Bandwidth**:
   - Apply peak traffic multiplier (2×):

**Peak Egress Bandwidth** = 40 Gbps × 2 = 80 Gbps

### Key takeaway

Network bandwidth is measured in **bits per second (bps)**, requiring multiplying Byte rates by **8**. Account for asymmetric traffic by estimating **Ingress (uploads)** and **Egress (downloads)** separately, and size hardware NICs for **Peak Bandwidth**.
