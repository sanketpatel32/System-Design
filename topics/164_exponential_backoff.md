# Exponential Backoff

> **Category:** Reliability and Fault Tolerance

---

Exponential backoff is a retry strategy that **exponentially increases the waiting time between consecutive retry attempts**. Incorporating **Jitter (randomized variation)** into the delay prevents "thundering herd" retry storms where large numbers of clients retry failed requests simultaneously at identical intervals.

### Exponential Backoff & Jitter Architecture

Adding randomized jitter distributes client retry attempts smoothly across time, preventing synchronized traffic spikes.

```
Without Jitter (Synchronized Thundering Herd Spike):
Client 1: [Fail] ----- Wait 2s ----- [Retry!] ----- Wait 4s ----- [Retry!]
Client 2: [Fail] ----- Wait 2s ----- [Retry!] ----- Wait 4s ----- [Retry!]
Client 3: [Fail] ----- Wait 2s ----- [Retry!] ----- Wait 4s ----- [Retry!]
                                       ^                            ^
                        MASSIVE CONGESTION SPIKE!     MASSIVE CONGESTION SPIKE!

With Full Jitter (Desynchronized Smoothed Traffic):
Client 1: [Fail] -- Wait 1.2s -- [Retry!] ------ Wait 3.8s ------ [Retry!]
Client 2: [Fail] ---- Wait 1.8s ---- [Retry!] -- Wait 2.1s -- [Retry!]
Client 3: [Fail] - Wait 0.4s - [Retry!] -------- Wait 4.1s -------- [Retry!]
```

### Exponential Backoff Formula with Full Jitter

The base backoff delay doubles with each attempt n, capped by a maximum delay limit:
Base Delay(n) = min(Max Delay, Initial Delay × 2ⁿ)

Applying **Full Jitter** selects a uniform random value between 0 and the calculated base delay:
Actual Delay(n) = random(0, Base Delay(n))

### Jitter Algorithm Comparison Matrix

| Jitter Strategy | Mathematical Formula | Traffic Distribution | System Protection Level |
| :--- | :--- | :--- | :--- |
| **No Jitter** | T = Base Delay(n) | Severe Periodic Spikes | Low (High risk of thundering herd) |
| **Full Jitter** | T = random(0, Base Delay(n)) | Fully Uniform Spread | Highest (Best overall desynchronization) |
| **Equal Jitter** | T = (Base / 2) + random(0, Base / 2) | Bounded Spread | High |
| **Decorrelated Jitter** | T = min(Max, random(Initial, T_prev × 3)) | Dynamic Adaptive Spread | High |

### Exponential Backoff Calculation Example

Given `Initial Delay = 100ms`, `Multiplier = 2`, `Max Delay = 10,000ms`:
- Attempt 1: Base = 100ms → Full Jitter = random(0, 100ms)
- Attempt 2: Base = 200ms → Full Jitter = random(0, 200ms)
- Attempt 3: Base = 400ms → Full Jitter = random(0, 400ms)
- Attempt 4: Base = 800ms → Full Jitter = random(0, 800ms)
### Full Jitter Backoff Code Implementation Example

```python
import random
import time

def execute_with_exponential_backoff(func, max_retries=5, initial_delay=0.1, max_delay=10.0):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e # Max retries reached, re-raise exception
            
            # Calculate Base Exponential Delay
            base_delay = min(max_delay, initial_delay * (2 ** attempt))
            
            # Apply Full Jitter: Uniform random between 0 and base_delay
            sleep_duration = random.uniform(0, base_delay)
            time.sleep(sleep_duration)
```

### Key takeaway

Always combine exponential backoff with **Full Jitter** to desynchronize retry attempts, protecting struggling backend services from retry storms.
