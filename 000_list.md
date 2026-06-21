# System Design Roadmap - Learning Order

<!-- System Design Basics -->

1. What is System Design?
2. High Level Design vs Low Level Design
3. Functional Requirements
4. Non-Functional Requirements
5. Scalability
6. Availability
7. Reliability
8. Latency
9. Throughput
10. Fault Tolerance
11. Maintainability
12. Consistency
13. Durability
14. CAP Theorem
15. Trade-offs in System Design

<!-- Back-of-the-Envelope Estimation -->

16. Estimate Daily Active Users
17. Estimate Requests Per Second
18. Estimate Peak QPS
19. Estimate Storage Requirement
20. Estimate Bandwidth Requirement
21. Estimate Cache Size
22. Estimate Number of Servers
23. Estimate Database Size
24. Estimate Cost at a High Level

<!-- Networking Basics -->

25. What Happens When You Type a URL in Browser?
26. DNS
27. IP Address
28. TCP vs UDP
29. HTTP vs HTTPS
30. HTTP Methods
31. HTTP Status Codes
32. REST API
33. RPC
34. GraphQL
35. WebSockets
36. Long Polling
37. Server-Sent Events

<!-- API Design -->

38. Design Good REST APIs
39. API Versioning
40. Pagination
41. Filtering and Sorting
42. Idempotency
43. API Rate Limiting
44. API Authentication
45. API Authorization
46. API Gateway
47. Webhooks
48. Error Handling in APIs

<!-- Load Balancing -->

49. Load Balancer Basics
50. Layer 4 Load Balancing
51. Layer 7 Load Balancing
52. Round Robin Load Balancing
53. Least Connections Load Balancing
54. Consistent Hashing Load Balancing
55. Sticky Sessions
56. Health Checks
57. Failover
58. Reverse Proxy

<!-- Scaling -->

59. Vertical Scaling
60. Horizontal Scaling
61. Stateless Services
62. Stateful Services
63. Auto Scaling
64. Database Scaling
65. Read Replicas
66. Write Scaling
67. Sharding
68. Partitioning
69. Hot Partition Problem
70. Fanout
71. Fanout on Write
72. Fanout on Read

<!-- Databases -->

73. SQL vs NoSQL
74. Relational Database Design
75. Primary Key
76. Foreign Key
77. Indexing
78. Composite Index
79. Database Transactions
80. ACID Properties
81. Isolation Levels
82. Normalization
83. Denormalization
84. Replication
85. Master-Slave Replication
86. Multi-Master Replication
87. Database Sharding
88. Consistent Hashing
89. Choosing the Right Database
90. Time Series Database
91. Graph Database
92. Columnar Database
93. Search Database

<!-- Caching -->

94. Cache Basics
95. Client-Side Cache
96. CDN Cache
97. Application Cache
98. Database Cache
99. Cache Aside Pattern
100. Read Through Cache
101. Write Through Cache
102. Write Back Cache
103. Cache Invalidation
104. Cache Eviction Policies
105. LRU Cache
106. Cache Stampede
107. Distributed Cache
108. Redis Use Cases

<!-- Message Queues and Event Streaming -->

109. Synchronous vs Asynchronous Communication
110. Message Queue Basics
111. Pub/Sub Model
112. Kafka Basics
113. RabbitMQ Basics
114. Producer Consumer Pattern
115. Queue vs Stream
116. Event Ordering
117. Message Retrying
118. Dead Letter Queue
119. Idempotent Consumers
120. At-Least-Once Delivery
121. At-Most-Once Delivery
122. Exactly-Once Delivery
123. Backpressure

<!-- Storage Systems -->

124. File Storage
125. Block Storage
126. Object Storage
127. Amazon S3 Style Storage
128. Blob Storage
129. Metadata Storage
130. Multipart Upload
131. Signed URLs
132. Image Upload System
133. Video Upload System
134. Video Transcoding Pipeline

<!-- CDN and Media Delivery -->

135. CDN Basics
136. Edge Servers
137. CDN Cache Invalidation
138. Static Content Delivery
139. Dynamic Content Delivery
140. Image Optimization
141. Video Streaming
142. Adaptive Bitrate Streaming
143. Live Streaming Basics

<!-- Distributed Systems -->

144. Distributed System Basics
145. Distributed Consensus
146. Leader Election
147. Distributed Lock
148. Quorum
149. Gossip Protocol
150. Vector Clocks
151. Clock Skew
152. Eventual Consistency
153. Strong Consistency
154. Read Repair
155. Write Conflict Resolution
156. Distributed Transactions
157. Two Phase Commit
158. Saga Pattern
159. CQRS
160. Event Sourcing

<!-- Reliability and Fault Tolerance -->

161. Single Point of Failure
162. Timeouts
163. Retries
164. Exponential Backoff
165. Circuit Breaker
166. Bulkhead Pattern
167. Graceful Degradation
168. Rate Limiting for Protection
169. Disaster Recovery
170. Backup and Restore
171. Multi-Region Deployment
172. Active-Passive Architecture
173. Active-Active Architecture
174. Chaos Testing

<!-- Observability -->

175. Logging
176. Metrics
177. Distributed Tracing
178. Monitoring
179. Alerting
180. Dashboards
181. Error Budgets
182. SLI
183. SLO
184. SLA

<!-- Security -->

185. TLS
186. HTTPS
187. Authentication
188. Authorization
189. Session Based Authentication
190. JWT Authentication
191. OAuth 2.0
192. API Keys
193. Secrets Management
194. Encryption at Rest
195. Encryption in Transit
196. PII Protection
197. DDoS Protection
198. Abuse Prevention

<!-- Beginner System Design Problems -->

199. Design URL Shortener
200. Design Pastebin
201. Design QR Code Generator
202. Design Rate Limiter
203. Design API Gateway
204. Design File Upload Service
205. Design Image Upload Service
206. Design Notification System
207. Design Email Service
208. Design Feature Flag System
209. Design Configuration Management System
210. Design Logging System

<!-- Intermediate System Design Problems -->

211. Design Instagram
212. Design Twitter / X
213. Design Facebook News Feed
214. Design LinkedIn Feed
215. Design Reddit
216. Design YouTube
217. Design Netflix
218. Design Spotify
219. Design WhatsApp
220. Design Slack
221. Design Discord
222. Design Zoom
223. Design Google Drive
224. Design Dropbox
225. Design Google Photos

<!-- Search and Recommendation Systems -->

226. Design Typeahead / Autocomplete
227. Design Search Engine
228. Design Web Crawler
229. Design News Search
230. Design Product Search
231. Design Recommendation System
232. Design Trending Topics
233. Design Personalized Feed
234. Design Ad Click Tracking System

<!-- Location Based Systems -->

235. Design Uber / Ola
236. Design Google Maps
237. Design Nearby Friends
238. Design Food Delivery App
239. Design Location Sharing System
240. Design Ride Matching System
241. Design ETA Calculation System
242. Design Geohashing Based System

<!-- E-Commerce and Payments -->

243. Design Amazon
244. Design Flipkart
245. Design Shopping Cart
246. Design Inventory Management System
247. Design Order Management System
248. Design Coupon System
249. Design Payment System
250. Design Wallet System
251. Design UPI Style Payment System
252. Design Ledger System
253. Design Ticket Booking System
254. Design BookMyShow

<!-- Data Intensive Systems -->

255. Design Analytics Platform
256. Design Metrics Collection System
257. Design Distributed Logging System
258. Design Real-Time Dashboard
259. Design Data Pipeline
260. Design ETL System
261. Design Data Lake
262. Design Fraud Detection System
263. Design A/B Testing Platform

<!-- Advanced System Design Problems -->

264. Design Distributed Cache
265. Design Redis
266. Design Distributed Queue
267. Design Kafka
268. Design Distributed Key-Value Store
269. Design DynamoDB
270. Design Cassandra
271. Design Google Bigtable
272. Design Elasticsearch
273. Design CDN
274. Design Cloud Storage
275. Design Multi-Region Database
276. Design Distributed Rate Limiter
277. Design Distributed Scheduler
278. Design CI/CD System
279. Design Kubernetes Like System

<!-- Real-Time Systems -->

280. Design Live Chat System
281. Design Multiplayer Game Backend
282. Design Collaborative Document Editor
283. Design Google Docs
284. Design Live Streaming Platform
285. Design Stock Price Streaming System
286. Design Online Auction System
287. Design Real-Time Notification System

<!-- Low Level Design - Optional but Useful -->

288. Design Parking Lot
289. Design Elevator System
290. Design Vending Machine
291. Design ATM
292. Design Library Management System
293. Design Hotel Booking System
294. Design Movie Ticket Booking System
295. Design Splitwise
296. Design Chess
297. Design Snake and Ladder
298. Design Logger
299. Design LRU Cache
300. Design Coffee Machine
