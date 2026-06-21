# Exponential Backoff

> **Category:** Reliability and Fault Tolerance

---

Exponential backoff = **waiting longer between each retry**. Gives the system time to
recover and prevents overload.

### Formula
```
delay(n) = base * 2^(n-1)
        = 1s, 2s, 4s, 8s, 16s, 32s, ...
```
- base = initial delay (typically 100ms-1s).
- Cap at max delay (e.g. 60s).

### Why exponential
- **Linear (fixed) backoff**: keeps hammering every 1s — no recovery.
- **Exponential**: gives more time each round — service can recover.

### With jitter (essential)
```
delay(n) = random(0, base * 2^(n-1))
```
- Adds randomness.
- Prevents **thundering herd**: if 1000 clients all retry at the same exponential time, they
  still synchronize. Jitter spreads them out.

### Variants

#### Full jitter
```
delay = random(0, base * 2^n)
```
Most aggressive randomization.

#### Equal jitter
```
temp = base * 2^n
delay = temp/2 + random(0, temp/2)
```
Half exponential + half random. Balances recovery time with spreading.

#### Decorrelated jitter
```
delay = random(base, prev_delay * 3)
```
Based on previous delay, not attempt number.

### Retry budget
- Cap retry duration at a max (e.g. 60s total).
- Or cap attempts at 3-5.

### Real-world
- AWS SDKs default to exponential + jitter.
- Cloudflare, Stripe: retry with `Retry-After` header.

### Example code
```python
import random, time
def retry_with_backoff(fn, max_attempts=5, base=1):
    for attempt in range(max_attempts):
        try:
            return fn()
        except Exception:
            if attempt == max_attempts - 1:
                raise
            delay = random.uniform(0, base * (2 ** attempt))
            time.sleep(delay)
```

### Key takeaway
Use **exponential backoff + jitter** for retries. Without jitter, retries synchronize and
re-overload the recovering service. Cap total attempts and total time. Idempotency makes retries
safe.
