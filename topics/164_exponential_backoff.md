# Exponential Backoff

> **Category:** Reliability and Fault Tolerance

---

Exponential Backoff is an algorithm that **increases the wait time exponentially between successive retries**, dampening request volume against recovering backend services.

### Exponential Wait Curve with Random Jitter

```
Retry Wait Time Timeline:
Attempt 1: [-- 1s --]
Attempt 2: [---- 2s ----]
Attempt 3: [-------- 4s --------]
Attempt 4: [---------------- 8s ----------------] + Random Jitter (+/- 500ms)
```

### Mathematical Formula

The delay before attempt \(n\) is calculated as:

\[
	ext{Delay}(n) = \min\left(	ext{Base} 	imes 2^{n-1} + 	ext{Jitter}, 	ext{MaxDelay}ight)
\]

Where:
- \(	ext{Base}\) = Initial backoff duration (e.g., 100 ms)
- \(n\) = Current retry attempt count
- \(	ext{Jitter}\) = Random noise (e.g., \(	ext{random}(0, 	ext{Delay})\))
- \(	ext{MaxDelay}\) = Cap boundary (e.g., 30 seconds)

### Jitter Strategy Comparison Matrix

| Jitter Strategy | Formula / Behavior | Prevents Clustered Spikes | Best Use Case |
| :--- | :--- | :--- | :--- |
| **No Jitter** | Exact exponential doubling (\(2^n\)) | No (Causes synchronized retry thundering herds)| Rarely recommended |
| **Full Jitter** | `random(0, Base * 2^n)` | Excellent | General RPC / API client retries |
| **Equal Jitter** | `(Base * 2^n) / 2 + random(0, (Base * 2^n) / 2)`| Very Good | Distributed Queue polling |

### System Design Impact

- **Thundering Herd Prevention**: Adding random jitter breaks synchronization between thousands of clients retrying concurrently.

### Key takeaway

Combine **exponential backoff with random jitter** to smooth out retry spikes and allow failing backend services room to recover.
