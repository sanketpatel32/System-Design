# DDoS Protection

> **Category:** Security

---

DDoS (Distributed Denial of Service) = **overwhelming a service with traffic from many
sources** to make it unavailable.

### Attack types
- **Volumetric**: saturate bandwidth (UDP floods, amplification).
- **Protocol**: exhaust server resources (SYN floods, Ping of Death).
- **Application**: valid-looking requests that exhaust app (HTTP floods, slowloris).

### Layers of defense

#### 1. Network / transport (L3/L4)
- **Cloud provider scrubbing**: AWS Shield, Cloudflare.
- **Rate limit at edge**.
- **SYN cookies**.
- **Anycast** distributes traffic across PoPs.

#### 2. Application (L7)
- **WAF** (Web Application Firewall): block malicious patterns.
- **Rate limit per IP / user**.
- **CAPTCHA** for suspicious traffic.
- **Behavioral analysis** (bot detection).

#### 3. Architecture
- **Autoscale** to absorb spikes.
- **Caches** so most requests never hit origin.
- **Queues** to absorb write spikes.
- **Circuit breakers** to shed load.
- **Geographic distribution** (CDN).

### Cloud services
- **Cloudflare** (free DDoS protection on all plans).
- **AWS Shield** (Standard free, Advanced paid).
- **Akamai**, **Imperva**, **Radware** (enterprise).

### Application-layer defenses
- **Rate limit aggressively** (per IP, per user).
- **CAPTCHA** for repeat offenders.
- **Slow-loris protection** (NGINX timeouts).
- **Bot management** (JavaScript challenges).

### During an attack
- Identify attack pattern.
- Apply WAF rules.
- Scale up.
- Blackhole specific IPs / ASNs.
- Engage DDoS mitigation provider.

### Costs
- DDoS can cost thousands of dollars/hour in cloud egress.
- Mitigation services pay for themselves quickly.

### Key takeaway
DDoS is inevitable. Defense in depth: **CDN + WAF + rate limiting + autoscaling + bot
management**. Cloudflare / AWS Shield at the edge. Don't try to handle it on your origin.
