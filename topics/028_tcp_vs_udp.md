# TCP vs UDP

> **Category:** Networking Basics

---

**TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** are the two fundamental Layer 4 (Transport Layer) protocols powering computer networks. TCP prioritizes **reliability and ordered delivery**, while UDP prioritizes **low latency and minimal overhead**.

### TCP 3-Way Handshake vs UDP Datagram Transmission

```
+-------------------------------------------------------------------------+
|                    TCP vs. UDP TRANSMISSION FLOW                        |
+-------------------------------------------------------------------------+

  TCP (Connection-Oriented, Guaranteed Order, Flow Controlled)
  Client                             Server
    |------ SYN (Seq=X) -------------->|
    |<----- SYN-ACK (Seq=Y, Ack=X+1) --|  (3-Way Handshake setup overhead)
    |------ ACK (Ack=Y+1) ------------>|
    |------ Data Packet 1 ------------>|
    |<----- ACK Packet 1 --------------|

  UDP (Connectionless, Low Overhead, Unreliable Delivery)
  Client                             Server
    |------ Datagram 1 --------------->|  (No handshake, no ACK overhead)
    |------ Datagram 2 --------------->|
```

### Technical Comparison Matrix

| Dimension | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection State** | Connection-oriented (Requires 3-way handshake) | Connectionless (Fires packets without setup) |
| **Reliability** | Guaranteed delivery via ACKs & retransmissions | Best-effort; lost packets are not retransmitted |
| **Data Order** | Strict in-order delivery via sequence numbers | Out-of-order packet delivery possible |
| **Header Size** | 20 to 60 Bytes | Fixed 8 Bytes |
| **Flow & Congestion Control**| Yes (Sliding window algorithm, slow start) | None (Sends packets at application transmission rate) |
| **Streaming Style** | Byte stream (Boundary not preserved) | Independent Datagrams (Message boundaries preserved)|
| **Use Cases** | Web (HTTP/HTTPS), Email (SMTP), Files (FTP), SSH | Live Video Streaming, Voice (VoIP), Gaming, DNS, QUIC |

### Key TCP Reliability Algorithms

1. **Sliding Window Flow Control**: Sender scales data transmission based on Receiver Window size (`rwnd`) to prevent overwhelming the client memory.
2. **Congestion Control (Slow Start, AIMD)**: Sender throttles rate upon packet loss detection to prevent network buffer overflow.
3. **Head-of-Line (HoL) Blocking**: If TCP Packet 2 is dropped, Packet 3 cannot be processed by application until Packet 2 is retransmitted, causing latency spikes.

### Modern Protocol Evolution: QUIC (HTTP/3)
HTTP/3 runs on top of **QUIC**, which uses **UDP at Layer 4** with custom zero-round-trip encryption and connection migration, eliminating TCP Head-of-Line blocking while maintaining reliability.

### Key takeaway

Use **TCP** when zero data loss and strict ordering are mandatory (HTTP APIs, database connections, financial transactions). Use **UDP** (or HTTP/3 over QUIC) when low latency takes priority over occasional packet loss (video calls, live gaming, DNS lookups).
