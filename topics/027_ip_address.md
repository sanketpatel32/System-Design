# IP Address

> **Category:** Networking Basics

---

An **IP (Internet Protocol) Address** is a unique numerical identifier assigned to every device connected to a network. Operating at Layer 3 (Network Layer) of the OSI model, IP addresses enable packet routing across interconnected networks globally.

### IPv4 vs IPv6 Structure Comparison

```
+-------------------------------------------------------------------------+
|                  IPv4 vs. IPv6 HEADER STRUCTURE                        |
+-------------------------------------------------------------------------+

  IPv4 (32-bit Address Space = ~4.3 Billion Addresses)
  +-----------+-----------+-----------+-----------+
  |  192      |  168      |  1        |  100      |  (Dotted Decimal)
  +-----------+-----------+-----------+-----------+

  IPv6 (128-bit Address Space = ~3.4 x 10^38 Addresses)
  +------+------+------+------+------+------+------+------+
  | 2001 | 0db8 | 85a3 | 0000 | 0000 | 8a2e | 0370 | 7334 | (Hexadecimal)
  +------+------+------+------+------+------+------+------+
```

### Technical Feature Breakdown

| Feature | IPv4 | IPv6 |
| :--- | :--- | :--- |
| **Address Length** | 32 bits (4 Bytes) | 128 bits (16 Bytes) |
| **Address Notation** | Dotted Decimal (e.g., `192.168.1.1`) | Hexadecimal Colon-Separated (`2001:db8::1`) |
| **Address Capacity** | ≈ 4.3 × 10⁹ (~4.3 Billion) | ≈ 3.4 × 10³⁸ (Virtually Unlimited) |
| **Header Size** | Variable (20 to 60 Bytes) | Fixed (40 Bytes) for fast router processing |
| **NAT Requirement** | Mandatory due to address exhaustion | Unnecessary (Every device gets public IPv6) |
| **Auto-Configuration**| DHCP required | SLAAC (Stateless Address Autoconfiguration) |

### Public vs. Private IP Addresses & CIDR Notation

- **Public IP**: Globally unique IP address routed across the public Internet.
- **Private IP**: Non-routable IP addresses used inside local networks (VPCs/LANs). Defined by RFC 1918:
  - `10.0.0.0 – 10.255.255.255` (`10.0.0.0/8`)
  - `172.16.0.0 – 172.31.255.255` (`172.16.0.0/12`)
  - `192.168.0.0 – 192.168.255.255` (`192.168.0.0/16`)

### CIDR Subnetting Reference

| CIDR Prefix | Subnet Mask | Available IPs | Common Cloud / VPC Use Case |
| :--- | :--- | :--- | :--- |
| `/32` | `255.255.255.255` | 1 | Single host IP assignment |
| `/24` | `255.255.255.0` | 256 (254 usable) | Standard microservice subnet |
| `/16` | `255.255.0.0` | 65,536 | Default AWS Virtual Private Cloud (VPC) |
| `/8` | `255.0.0.0` | 16,777,216 | Large enterprise internal network backbone |

### NAT (Network Address Translation)
Because public IPv4 addresses are exhausted, NAT allows hundreds of private instances inside a subnetwork to share a single public IP address when making outbound internet requests.

### Key takeaway

Understand the distinction between **IPv4 (32-bit)** and **IPv6 (128-bit)** addresses. Use private IPv4 CIDR blocks (`/16` VPCs, `/24` subnets) combined with **NAT Gateways** to isolate cloud backend infrastructure securely from the public internet.
