# Design Netflix

> **Category:** Intermediate System Design Problems

---

Design Netflix: stream movies/TV, personalized home, resumes across devices.

### Similar to YouTube with extras:
- **Licensed content** (not user-uploaded).
- **Continuous watch** (resume across devices).
- **Personalized rows** ("Trending Now", "Because you watched X").

### Architecture
- Same transcoding + CDN core.
- **Recommendation service** (rows) is critical.
- **Resume service** tracks position per user per device.

### CDN strategy
- Netflix Open Connect: own appliances inside ISPs.
- Push content to edges during off-peak.
- 95%+ served from edge.

### Recommendations
- Per-row generation.
- Different algorithms per row (popular, similar to watched, new releases).
- A/B tested continuously.

### Key takeaway
Netflix = YouTube-style streaming + own CDN (Open Connect) at ISPs + heavy recommendation ML.
Edge caching to 95%+ hit rate. Rows personalized via different algorithms.
