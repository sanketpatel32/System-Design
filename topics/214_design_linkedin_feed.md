# Design LinkedIn Feed
> **Category:** Intermediate System Design Problems

---

### Overview
**LinkedIn Feed** is a professional content delivery system that aggregates updates, job postings, industry articles, and viral professional posts from 1st-degree connections, followed companies, and industry hashtags.

The platform balances professional network graph updates with **spam/clickbait detection classifiers** and member career relevance scoring.

### System Architecture & Professional Feed Topology

```
+-------------------+     1. Fetch Feed Request             +--------------------+
| LinkedIn App      | ------------------------------------> | API Gateway        |
+-------------------+                                       +--------------------+
                                                                      |
                                                                      v 2. Query Graph & Groups
                                                            +--------------------+
                                                            | Economic Graph Engine|
                                                            | (1st Degree & Tags)|
                                                            +--------------------+
                                                                      |
                                                                      v 3. Filter Candidates
                                                            +--------------------+
                                                            | Spam & Quality     |
                                                            | Classifier Filter  |
                                                            +--------------------+
                                                                      |
                                                                      v 4. Rank Relevant Posts
                                                            +--------------------+
                                                            | Relevance Ranker   |
                                                            | (Job/Skill Alignment)|
                                                            +--------------------+
```

### Key Technical Mechanics
1. **Economic Graph Engine:** Indexes member connections, company followers, group memberships, and skill tags to assemble a relevant candidate pool of updates.
2. **Spam & Content Quality Filter:** Classifies posts into *Spam*, *Low Quality*, or *Clear* using NLP classifiers before posts reach the ranking pipeline, eliminating clickbait.
3. **Professional Relevance Ranking:** Boosts posts relevant to a member's industry, job title, and skill profile (e.g., software engineering posts boosted for developers).

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/feed` | GET | `{"member_id": "m_992", "limit": 15}` | `{"elements": [{"activity_id": "act_881", "type": "SHARE", "actor": "m_104"}]}` |
| `/api/v1/activities` | POST | `{"text": "Excited to share our new research paper...", "visibility": "PUBLIC"}` | `{"activity_id": "act_881", "status": "PUBLISHED"}` |

### LinkedIn Feed Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `activity_id` | String (Urn) | Espresso DB (Document Store)| Unique Primary Key (`urn:li:activity:78129...`). |
| `actor_urn` | String | Espresso DB | Member or company URN creating the activity. |
| `quality_score` | Float | Redis Cache | Quality classifier output score. |
| `skill_tags` | Array of Strings | Espresso DB | Extracted professional topic tags (e.g., `["System Design", "Java"]`). |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Quality Classifier Pre-Filtering** | Keeps professional feed clean by dropping spam and low-quality posts before ranking. | Risk of false positives hiding legitimate member posts. | Professional networking and business feeds. |
| **Espresso Distributed Document DB**| Custom transactional document store supporting schema evolution and timeline reads. | Proprietary LinkedIn technology stack maintenance. | Enterprise member activity and feed storage. |
| **Career & Skill-Based Boosting** | Delivers highly relevant industry news matching the member's current career domain. | Requires active profile data (industry, job title) to compute relevance accurately. | Professional B2B feeds. |

### Key takeaway
**LinkedIn Feed** filters professional activities through an **Upfront Content Quality Classifier** to purge spam, scoring surviving posts using an **Economic Graph Engine** aligned with member skills and industry relevance.
