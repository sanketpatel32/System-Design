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

$$1\,\text{Byte (B)} = 8\,\text{bits (b)}$$

| Storage Unit | Network Bandwidth Equivalent ($8\times$) | Example Scenario |
| :--- | :--- | :--- |
| **1 MB/s (Megabyte/sec)** | **8 Mbps (Megabits/sec)** | Low-bitrate 1080p video stream |
| **125 MB/s** | **1 Gbps (Gigabit/sec)** | Standard 1 Gbps NIC line saturation |
| **1.25 GB/s** | **10 Gbps** | High-density rack switch backbone |
| **12.5 GB/s** | **100 Gbps** | Datacenter core router link |

### Step-by-Step Bandwidth Calculation Walkthrough

1. **Given System Requirements**:
   - **Video Streaming Service** (e.g., YouTube subset):
   - Daily active streams $= 10\,\text{Million daily video plays}$.
   - Average video size $= 50\,\text{MB}$.
   - Read:Write ratio is highly egress-heavy ($100:1$).

2. **Calculate Daily Egress Volume**:

$$\text{Daily Egress Data} = 10\,\text{M videos} \times 50\,\text{MB} = 500,000,000\,\text{MB} = 500\,\text{TB/day}$$

3. **Calculate Average Egress Bandwidth**:
   - Divide by $86,400$ seconds (approx $100,000$):

$$\text{Average Egress Data Rate} = \frac{500\,\text{TB}}{100,000\,\text{sec}} = 0.005\,\text{TB/sec} = 5\,\text{GB/sec}$$

4. **Convert Bytes to Bits for Network Sizing**:

$$\text{Average Egress Bandwidth} = 5\,\text{GB/sec} \times 8\,\frac{\text{bits}}{\text{Byte}} = 40\,\text{Gbps (Gigabits per second)}$$

5. **Calculate Peak Egress Bandwidth**:
   - Apply peak traffic multiplier ($2\times$):

$$\text{Peak Egress Bandwidth} = 40\,\text{Gbps} \times 2 = 80\,\text{Gbps}$$

### Key takeaway

Network bandwidth is measured in **bits per second (bps)**, requiring multiplying Byte rates by **8**. Account for asymmetric traffic by estimating **Ingress (uploads)** and **Egress (downloads)** separately, and size hardware NICs for **Peak Bandwidth**.
