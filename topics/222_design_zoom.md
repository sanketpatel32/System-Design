# Design Zoom
> **Category:** Intermediate System Design Problems

---

### Overview
**Zoom** is a real-time video conferencing platform engineered to deliver sub-150ms latency audio and video streams across varying network conditions for up to thousands of interactive meeting participants.

### Architecture Topology Diagram

```
+--------------------------------------------------------------------------+
|                        ZOOM MEETING ARCHITECTURE                         |
+--------------------------------------------------------------------------+
  Participant A (Webcam/Mic)                    Participant B (Webcam/Mic)
       |                                             |
       | Encrypted UDP (RTP / SRTP)                  | Encrypted UDP (SRTP)
       v                                             v
+--------------------------------------------------------------------------+
|                  MULTIMEDIA ROUTING NODE (SFU CLUSTER)                   |
|                                                                          |
|  [ Bandwidth Probing ] --> [ Packet Loss Recovery ] --> [ Stream Forward]|
+--------------------------------------------------------------------------+
                                     ^
                                     | Meeting Signaling / Room Setup
+--------------------------------------------------------------------------+
|                        ZOOM CLOUD CONTROL PLANE                          |
|  [ User Auth ] --> [ Meeting Scheduler ] --> [ Meeting Controller DB ]   |
+--------------------------------------------------------------------------+
```

### Protocol & Network Optimization Matrix

| Mechanism | Engineering Strategy | Latency / Resilience Impact |
|---|---|---|
| **Transport Protocol** | Custom **UDP (SRTP)** instead of TCP | Eliminates head-of-line blocking latency |
| **Media Architecture**| Selective Forwarding Unit (**SFU**) | Forwards stream streams directly without re-encoding |
| **Adaptive Video** | Dynamic resolution switching (720p -> 360p -> 180p) | Adjusts video quality instantly during bandwidth drops |
| **Loss Recovery** | Forward Error Correction (**FEC**) + Selective NACK | Recovers lost packets without full retransmission |

### Selective Forwarding Unit (SFU) vs Multipoint Control Unit (MCU)

| Architecture Model | Video Processing | Bandwidth Usage | Server CPU Overhead |
|---|---|---|---|
| **MCU (Legacy)** | Decodes and composites all video inputs into 1 stream | Low client bandwidth | **Extremely High** server CPU |
| **SFU (Zoom Model)**| Forwards active speaker streams directly to clients | Dynamic per client | **Very Low** server CPU |

### Key takeaway
Zoom delivers sub-150ms meeting latency by executing media forwarding over custom **UDP (SRTP)** using **Selective Forwarding Units (SFUs)** paired with **Forward Error Correction (FEC)**.
