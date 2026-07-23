# System Design Roadmap — Learning Order

A curated set of **300 system design topics** arranged in a deliberate learning order — from core concepts (CAP, scalability, networking) to full design problems (URL shortener, Twitter, Uber) to low-level design (Chess, Parking Lot, ATM). Each `.md` file contains interview-ready detail with ASCII architecture diagrams.

> Click any title to open its file. Sections follow the recommended learning order.

---

## System Design Basics

1. [What is System Design?](topics/001_what_is_system_design.md)
2. [High Level Design vs Low Level Design](topics/002_high_level_vs_low_level_design.md)
3. [Functional Requirements](topics/003_functional_requirements.md)
4. [Non-Functional Requirements](topics/004_non_functional_requirements.md)
5. [Scalability](topics/005_scalability.md)
6. [Availability](topics/006_availability.md)
7. [Reliability](topics/007_reliability.md)
8. [Latency](topics/008_latency.md)
9. [Throughput](topics/009_throughput.md)
10. [Fault Tolerance](topics/010_fault_tolerance.md)
11. [Maintainability](topics/011_maintainability.md)
12. [Consistency](topics/012_consistency.md)
13. [Durability](topics/013_durability.md)
14. [CAP Theorem](topics/014_cap_theorem.md)
15. [Trade-offs in System Design](topics/015_tradeoffs_in_system_design.md)

## Back-of-the-Envelope Estimation

16. [Estimate Daily Active Users](topics/016_estimate_daily_active_users.md)
17. [Estimate Requests Per Second](topics/017_estimate_requests_per_second.md)
18. [Estimate Peak QPS](topics/018_estimate_peak_qps.md)
19. [Estimate Storage Requirement](topics/019_estimate_storage_requirement.md)
20. [Estimate Bandwidth Requirement](topics/020_estimate_bandwidth_requirement.md)
21. [Estimate Cache Size](topics/021_estimate_cache_size.md)
22. [Estimate Number of Servers](topics/022_estimate_number_of_servers.md)
23. [Estimate Database Size](topics/023_estimate_database_size.md)
24. [Estimate Cost at a High Level](topics/024_estimate_cost_at_a_high_level.md)

## Networking Basics

25. [What Happens When You Type a URL in Browser?](topics/025_what_happens_when_you_type_a_url_in_browser.md)
26. [DNS](topics/026_dns.md)
27. [IP Address](topics/027_ip_address.md)
28. [TCP vs UDP](topics/028_tcp_vs_udp.md)
29. [HTTP vs HTTPS](topics/029_http_vs_https.md)
30. [HTTP Methods](topics/030_http_methods.md)
31. [HTTP Status Codes](topics/031_http_status_codes.md)
32. [REST API](topics/032_rest_api.md)
33. [RPC](topics/033_rpc.md)
34. [GraphQL](topics/034_graphql.md)
35. [WebSockets](topics/035_websockets.md)
36. [Long Polling](topics/036_long_polling.md)
37. [Server-Sent Events](topics/037_server_sent_events.md)

## API Design

38. [Design Good REST APIs](topics/038_design_good_rest_apis.md)
39. [API Versioning](topics/039_api_versioning.md)
40. [Pagination](topics/040_pagination.md)
41. [Filtering and Sorting](topics/041_filtering_and_sorting.md)
42. [Idempotency](topics/042_idempotency.md)
43. [API Rate Limiting](topics/043_api_rate_limiting.md)
44. [API Authentication](topics/044_api_authentication.md)
45. [API Authorization](topics/045_api_authorization.md)
46. [API Gateway](topics/046_api_gateway.md)
47. [Webhooks](topics/047_webhooks.md)
48. [Error Handling in APIs](topics/048_error_handling_in_apis.md)

## Load Balancing

49. [Load Balancer Basics](topics/049_load_balancer_basics.md)
50. [Layer 4 Load Balancing](topics/050_layer_4_load_balancing.md)
51. [Layer 7 Load Balancing](topics/051_layer_7_load_balancing.md)
52. [Round Robin Load Balancing](topics/052_round_robin_load_balancing.md)
53. [Least Connections Load Balancing](topics/053_least_connections_load_balancing.md)
54. [Consistent Hashing Load Balancing](topics/054_consistent_hashing_load_balancing.md)
55. [Sticky Sessions](topics/055_sticky_sessions.md)
56. [Health Checks](topics/056_health_checks.md)
57. [Failover](topics/057_failover.md)
58. [Reverse Proxy](topics/058_reverse_proxy.md)

## Scaling

59. [Vertical Scaling](topics/059_vertical_scaling.md)
60. [Horizontal Scaling](topics/060_horizontal_scaling.md)
61. [Stateless Services](topics/061_stateless_services.md)
62. [Stateful Services](topics/062_stateful_services.md)
63. [Auto Scaling](topics/063_auto_scaling.md)
64. [Database Scaling](topics/064_database_scaling.md)
65. [Read Replicas](topics/065_read_replicas.md)
66. [Write Scaling](topics/066_write_scaling.md)
67. [Sharding](topics/067_sharding.md)
68. [Partitioning](topics/068_partitioning.md)
69. [Hot Partition Problem](topics/069_hot_partition_problem.md)
70. [Fanout](topics/070_fanout.md)
71. [Fanout on Write](topics/071_fanout_on_write.md)
72. [Fanout on Read](topics/072_fanout_on_read.md)

## Databases

73. [SQL vs NoSQL](topics/073_sql_vs_nosql.md)
74. [Relational Database Design](topics/074_relational_database_design.md)
75. [Primary Key](topics/075_primary_key.md)
76. [Foreign Key](topics/076_foreign_key.md)
77. [Indexing](topics/077_indexing.md)
78. [Composite Index](topics/078_composite_index.md)
79. [Database Transactions](topics/079_database_transactions.md)
80. [ACID Properties](topics/080_acid_properties.md)
81. [Isolation Levels](topics/081_isolation_levels.md)
82. [Normalization](topics/082_normalization.md)
83. [Denormalization](topics/083_denormalization.md)
84. [Replication](topics/084_replication.md)
85. [Master-Slave Replication](topics/085_master_slave_replication.md)
86. [Multi-Master Replication](topics/086_multi_master_replication.md)
87. [Database Sharding](topics/087_database_sharding.md)
88. [Consistent Hashing](topics/088_consistent_hashing.md)
89. [Choosing the Right Database](topics/089_choosing_the_right_database.md)
90. [Time Series Database](topics/090_time_series_database.md)
91. [Graph Database](topics/091_graph_database.md)
92. [Columnar Database](topics/092_columnar_database.md)
93. [Search Database](topics/093_search_database.md)

## Caching

94. [Cache Basics](topics/094_cache_basics.md)
95. [Client-Side Cache](topics/095_client_side_cache.md)
96. [CDN Cache](topics/096_cdn_cache.md)
97. [Application Cache](topics/097_application_cache.md)
98. [Database Cache](topics/098_database_cache.md)
99. [Cache Aside Pattern](topics/099_cache_aside_pattern.md)
100. [Read Through Cache](topics/100_read_through_cache.md)
101. [Write Through Cache](topics/101_write_through_cache.md)
102. [Write Back Cache](topics/102_write_back_cache.md)
103. [Cache Invalidation](topics/103_cache_invalidation.md)
104. [Cache Eviction Policies](topics/104_cache_eviction_policies.md)
105. [LRU Cache](topics/105_lru_cache.md)
106. [Cache Stampede](topics/106_cache_stampede.md)
107. [Distributed Cache](topics/107_distributed_cache.md)
108. [Redis Use Cases](topics/108_redis_use_cases.md)

## Message Queues and Event Streaming

109. [Synchronous vs Asynchronous Communication](topics/109_synchronous_vs_asynchronous_communication.md)
110. [Message Queue Basics](topics/110_message_queue_basics.md)
111. [Pub/Sub Model](topics/111_pub_sub_model.md)
112. [Kafka Basics](topics/112_kafka_basics.md)
113. [RabbitMQ Basics](topics/113_rabbitmq_basics.md)
114. [Producer Consumer Pattern](topics/114_producer_consumer_pattern.md)
115. [Queue vs Stream](topics/115_queue_vs_stream.md)
116. [Event Ordering](topics/116_event_ordering.md)
117. [Message Retrying](topics/117_message_retrying.md)
118. [Dead Letter Queue](topics/118_dead_letter_queue.md)
119. [Idempotent Consumers](topics/119_idempotent_consumers.md)
120. [At-Least-Once Delivery](topics/120_at_least_once_delivery.md)
121. [At-Most-Once Delivery](topics/121_at_most_once_delivery.md)
122. [Exactly-Once Delivery](topics/122_exactly_once_delivery.md)
123. [Backpressure](topics/123_backpressure.md)

## Storage Systems

124. [File Storage](topics/124_file_storage.md)
125. [Block Storage](topics/125_block_storage.md)
126. [Object Storage](topics/126_object_storage.md)
127. [Amazon S3 Style Storage](topics/127_amazon_s3_style_storage.md)
128. [Blob Storage](topics/128_blob_storage.md)
129. [Metadata Storage](topics/129_metadata_storage.md)
130. [Multipart Upload](topics/130_multipart_upload.md)
131. [Signed URLs](topics/131_signed_urls.md)
132. [Image Upload System](topics/132_image_upload_system.md)
133. [Video Upload System](topics/133_video_upload_system.md)
134. [Video Transcoding Pipeline](topics/134_video_transcoding_pipeline.md)

## CDN and Media Delivery

135. [CDN Basics](topics/135_cdn_basics.md)
136. [Edge Servers](topics/136_edge_servers.md)
137. [CDN Cache Invalidation](topics/137_cdn_cache_invalidation.md)
138. [Static Content Delivery](topics/138_static_content_delivery.md)
139. [Dynamic Content Delivery](topics/139_dynamic_content_delivery.md)
140. [Image Optimization](topics/140_image_optimization.md)
141. [Video Streaming](topics/141_video_streaming.md)
142. [Adaptive Bitrate Streaming](topics/142_adaptive_bitrate_streaming.md)
143. [Live Streaming Basics](topics/143_live_streaming_basics.md)

## Distributed Systems

144. [Distributed System Basics](topics/144_distributed_system_basics.md)
145. [Distributed Consensus](topics/145_distributed_consensus.md)
146. [Leader Election](topics/146_leader_election.md)
147. [Distributed Lock](topics/147_distributed_lock.md)
148. [Quorum](topics/148_quorum.md)
149. [Gossip Protocol](topics/149_gossip_protocol.md)
150. [Vector Clocks](topics/150_vector_clocks.md)
151. [Clock Skew](topics/151_clock_skew.md)
152. [Eventual Consistency](topics/152_eventual_consistency.md)
153. [Strong Consistency](topics/153_strong_consistency.md)
154. [Read Repair](topics/154_read_repair.md)
155. [Write Conflict Resolution](topics/155_write_conflict_resolution.md)
156. [Distributed Transactions](topics/156_distributed_transactions.md)
157. [Two Phase Commit](topics/157_two_phase_commit.md)
158. [Saga Pattern](topics/158_saga_pattern.md)
159. [CQRS](topics/159_cqrs.md)
160. [Event Sourcing](topics/160_event_sourcing.md)

## Reliability and Fault Tolerance

161. [Single Point of Failure](topics/161_single_point_of_failure.md)
162. [Timeouts](topics/162_timeouts.md)
163. [Retries](topics/163_retries.md)
164. [Exponential Backoff](topics/164_exponential_backoff.md)
165. [Circuit Breaker](topics/165_circuit_breaker.md)
166. [Bulkhead Pattern](topics/166_bulkhead_pattern.md)
167. [Graceful Degradation](topics/167_graceful_degradation.md)
168. [Rate Limiting for Protection](topics/168_rate_limiting_for_protection.md)
169. [Disaster Recovery](topics/169_disaster_recovery.md)
170. [Backup and Restore](topics/170_backup_and_restore.md)
171. [Multi-Region Deployment](topics/171_multi_region_deployment.md)
172. [Active-Passive Architecture](topics/172_active_passive_architecture.md)
173. [Active-Active Architecture](topics/173_active_active_architecture.md)
174. [Chaos Testing](topics/174_chaos_testing.md)

## Observability

175. [Logging](topics/175_logging.md)
176. [Metrics](topics/176_metrics.md)
177. [Distributed Tracing](topics/177_distributed_tracing.md)
178. [Monitoring](topics/178_monitoring.md)
179. [Alerting](topics/179_alerting.md)
180. [Dashboards](topics/180_dashboards.md)
181. [Error Budgets](topics/181_error_budgets.md)
182. [SLI](topics/182_sli.md)
183. [SLO](topics/183_slo.md)
184. [SLA](topics/184_sla.md)

## Security

185. [TLS](topics/185_tls.md)
186. [HTTPS](topics/186_https.md)
187. [Authentication](topics/187_authentication.md)
188. [Authorization](topics/188_authorization.md)
189. [Session Based Authentication](topics/189_session_based_authentication.md)
190. [JWT Authentication](topics/190_jwt_authentication.md)
191. [OAuth 2.0](topics/191_oauth_2_0.md)
192. [API Keys](topics/192_api_keys.md)
193. [Secrets Management](topics/193_secrets_management.md)
194. [Encryption at Rest](topics/194_encryption_at_rest.md)
195. [Encryption in Transit](topics/195_encryption_in_transit.md)
196. [PII Protection](topics/196_pii_protection.md)
197. [DDoS Protection](topics/197_ddos_protection.md)
198. [Abuse Prevention](topics/198_abuse_prevention.md)

## Beginner System Design Problems

199. [Design URL Shortener](topics/199_design_url_shortener.md)
200. [Design Pastebin](topics/200_design_pastebin.md)
201. [Design QR Code Generator](topics/201_design_qr_code_generator.md)
202. [Design Rate Limiter](topics/202_design_rate_limiter.md)
203. [Design API Gateway](topics/203_design_api_gateway.md)
204. [Design File Upload Service](topics/204_design_file_upload_service.md)
205. [Design Image Upload Service](topics/205_design_image_upload_service.md)
206. [Design Notification System](topics/206_design_notification_system.md)
207. [Design Email Service](topics/207_design_email_service.md)
208. [Design Feature Flag System](topics/208_design_feature_flag_system.md)
209. [Design Configuration Management System](topics/209_design_configuration_management_system.md)
210. [Design Logging System](topics/210_design_logging_system.md)

## Intermediate System Design Problems

211. [Design Instagram](topics/211_design_instagram.md)
212. [Design Twitter / X](topics/212_design_twitter.md)
213. [Design Facebook News Feed](topics/213_design_facebook_news_feed.md)
214. [Design LinkedIn Feed](topics/214_design_linkedin_feed.md)
215. [Design Reddit](topics/215_design_reddit.md)
216. [Design YouTube](topics/216_design_youtube.md)
217. [Design Netflix](topics/217_design_netflix.md)
218. [Design Spotify](topics/218_design_spotify.md)
219. [Design WhatsApp](topics/219_design_whatsapp.md)
220. [Design Slack](topics/220_design_slack.md)
221. [Design Discord](topics/221_design_discord.md)
222. [Design Zoom](topics/222_design_zoom.md)
223. [Design Google Drive](topics/223_design_google_drive.md)
224. [Design Dropbox](topics/224_design_dropbox.md)
225. [Design Google Photos](topics/225_design_google_photos.md)

## Search and Recommendation Systems

226. [Design Typeahead / Autocomplete](topics/226_design_typeahead_autocomplete.md)
227. [Design Search Engine](topics/227_design_search_engine.md)
228. [Design Web Crawler](topics/228_design_web_crawler.md)
229. [Design News Search](topics/229_design_news_search.md)
230. [Design Product Search](topics/230_design_product_search.md)
231. [Design Recommendation System](topics/231_design_recommendation_system.md)
232. [Design Trending Topics](topics/232_design_trending_topics.md)
233. [Design Personalized Feed](topics/233_design_personalized_feed.md)
234. [Design Ad Click Tracking System](topics/234_design_ad_click_tracking_system.md)

## Location Based Systems

235. [Design Uber / Ola](topics/235_design_uber.md)
236. [Design Google Maps](topics/236_design_google_maps.md)
237. [Design Nearby Friends](topics/237_design_nearby_friends.md)
238. [Design Food Delivery App](topics/238_design_food_delivery_app.md)
239. [Design Location Sharing System](topics/239_design_location_sharing_system.md)
240. [Design Ride Matching System](topics/240_design_ride_matching_system.md)
241. [Design ETA Calculation System](topics/241_design_eta_calculation_system.md)
242. [Design Geohashing Based System](topics/242_design_geohashing_based_system.md)

## E-Commerce and Payments

243. [Design Amazon](topics/243_design_amazon.md)
244. [Design Flipkart](topics/244_design_flipkart.md)
245. [Design Shopping Cart](topics/245_design_shopping_cart.md)
246. [Design Inventory Management System](topics/246_design_inventory_management_system.md)
247. [Design Order Management System](topics/247_design_order_management_system.md)
248. [Design Coupon System](topics/248_design_coupon_system.md)
249. [Design Payment System](topics/249_design_payment_system.md)
250. [Design Wallet System](topics/250_design_wallet_system.md)
251. [Design UPI Style Payment System](topics/251_design_upi_style_payment_system.md)
252. [Design Ledger System](topics/252_design_ledger_system.md)
253. [Design Ticket Booking System](topics/253_design_ticket_booking_system.md)
254. [Design BookMyShow](topics/254_design_bookmyshow.md)

## Data Intensive Systems

255. [Design Analytics Platform](topics/255_design_analytics_platform.md)
256. [Design Metrics Collection System](topics/256_design_metrics_collection_system.md)
257. [Design Distributed Logging System](topics/257_design_distributed_logging_system.md)
258. [Design Real-Time Dashboard](topics/258_design_real_time_dashboard.md)
259. [Design Data Pipeline](topics/259_design_data_pipeline.md)
260. [Design ETL System](topics/260_design_etl_system.md)
261. [Design Data Lake](topics/261_design_data_lake.md)
262. [Design Fraud Detection System](topics/262_design_fraud_detection_system.md)
263. [Design A/B Testing Platform](topics/263_design_ab_testing_platform.md)

## Advanced System Design Problems

264. [Design Distributed Cache](topics/264_design_distributed_cache.md)
265. [Design Redis](topics/265_design_redis.md)
266. [Design Distributed Queue](topics/266_design_distributed_queue.md)
267. [Design Kafka](topics/267_design_kafka.md)
268. [Design Distributed Key-Value Store](topics/268_design_distributed_key_value_store.md)
269. [Design DynamoDB](topics/269_design_dynamodb.md)
270. [Design Cassandra](topics/270_design_cassandra.md)
271. [Design Google Bigtable](topics/271_design_bigtable.md)
272. [Design Elasticsearch](topics/272_design_elasticsearch.md)
273. [Design CDN](topics/273_design_cdn.md)
274. [Design Cloud Storage](topics/274_design_cloud_storage.md)
275. [Design Multi-Region Database](topics/275_design_multi_region_database.md)
276. [Design Distributed Rate Limiter](topics/276_design_distributed_rate_limiter.md)
277. [Design Distributed Scheduler](topics/277_design_distributed_scheduler.md)
278. [Design CI/CD System](topics/278_design_cicd_system.md)
279. [Design Kubernetes Like System](topics/279_design_kubernetes_like_system.md)

## Real-Time Systems

280. [Design Live Chat System](topics/280_design_live_chat_system.md)
281. [Design Multiplayer Game Backend](topics/281_design_multiplayer_game_backend.md)
282. [Design Collaborative Document Editor](topics/282_design_collaborative_document_editor.md)
283. [Design Google Docs](topics/283_design_google_docs.md)
284. [Design Live Streaming Platform](topics/284_design_live_streaming_platform.md)
285. [Design Stock Price Streaming System](topics/285_design_stock_price_streaming_system.md)
286. [Design Online Auction System](topics/286_design_online_auction_system.md)
287. [Design Real-Time Notification System](topics/287_design_real_time_notification_system.md)

## Low Level Design - Optional but Useful

288. [Design Parking Lot](topics/288_design_parking_lot.md)
289. [Design Elevator System](topics/289_design_elevator_system.md)
290. [Design Vending Machine](topics/290_design_vending_machine.md)
291. [Design ATM](topics/291_design_atm.md)
292. [Design Library Management System](topics/292_design_library_management_system.md)
293. [Design Hotel Booking System](topics/293_design_hotel_booking_system.md)
294. [Design Movie Ticket Booking System](topics/294_design_movie_ticket_booking_system.md)
295. [Design Splitwise](topics/295_design_splitwise.md)
296. [Design Chess](topics/296_design_chess.md)
297. [Design Snake and Ladder](topics/297_design_snake_and_ladder.md)
298. [Design Logger](topics/298_design_logger.md)
299. [Design LRU Cache](topics/299_design_lru_cache.md)
300. [Design Coffee Machine](topics/300_design_coffee_machine.md)

---

**Total: 300 problems** across 24 categories.
