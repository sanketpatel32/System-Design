# Design Fraud Detection System

> **Category:** Data Intensive Systems

---

Design a fraud detection system: flag suspicious transactions in real time.

### Requirements
- **Functional**: score transactions; block / approve / review.
- **Non-functional**: real-time (<100ms decision); accurate.

### Architecture
```
[Transaction] -> [Feature extraction] -> [ML model] -> [Decision]
                                              |
                                              v
                                         [Rules engine]
                                         [Manual review queue]
```

### Features
- **User features**: past behavior, account age.
- **Transaction features**: amount, location, time.
- **Device features**: fingerprint, IP, VPN.
- **Velocity features**: count in last hour/day.
- **Graph features**: connected to known fraud?

### Models
- **Rules**: simple, fast (amount > 10k, foreign IP).
- **ML**: gradient boosting (XGBoost), deep learning.
- **Hybrid**: rules for obvious, ML for subtle.

### Real-time scoring
- Stream processor computes features.
- Model scores in <100ms.
- Decision: approve / block / review.

### Feedback loop
- Confirmed fraud → label → retrain.
- False positives → adjust thresholds.

### Key takeaway
Fraud detection = real-time feature extraction + rules + ML model. Hybrid (rules for obvious,
ML for subtle). Velocity + graph features catch rings. Continuous feedback loop for model
improvement.
