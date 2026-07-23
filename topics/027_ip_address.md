# IP Address

> **Category:** Networking Basics

---

An IP address uniquely identifies a network interface. There are two versions in production.

### IPv4 vs IPv6
| | IPv4 | IPv6 |
|--|------|------|
| Length | 32-bit | 128-bit |
| Format | 192.168.1.1 | 2001:db8::1 |
| Address space | ~4.3 billion | ~3.4 × 10^38 |
| Status | Exhausted, still dominant | Future-proof, growing adoption |

### Private vs public
- **Public IPs**: routable on the internet.
- **Private IPs** (RFC 1918): `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x` — used inside VPCs/LANs.
- **NAT** translates private → public at the gateway.

### Subnetting
CIDR notation: `10.0.0.0/24` = 256 addresses (254 usable).
- `/24` — small subnet (256 IPs)
- `/16` — 65k IPs
- `/8` — 16M IPs

### Special addresses
- `127.0.0.1` — loopback (localhost)
- `0.0.0.0` — "any" / unspecified
- `169.254.x.x` — link-local (AWS metadata service is at 169.254.169.254)
- `255.255.255.255` — broadcast

### Why it matters
- **Subnet design**: separate tiers (web/app/db) for security groups.
- **Elastic IPs**: stable public IP that survives instance restart.
- **Anycast**: same IP advertised from many locations (DNS root, CDNs).

### Key takeaway
Know IPv4 vs IPv6, private vs public, CIDR ranges, and how NAT bridges them. In cloud design,
every service sits in a subnet — getting IP topology right avoids painful refactors.
