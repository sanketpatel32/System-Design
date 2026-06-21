# System Design Roadmap — Learning Order

A curated set of **300 system design topics** arranged in a deliberate learning order — from core concepts (CAP, scalability, networking) to full design problems (URL shortener, Twitter, Uber) to low-level design (Chess, Parking Lot, ATM). Each `.md` file contains interview-ready detail with ASCII architecture diagrams.

> Click any title to open its file. Sections follow the recommended learning order.

---

## System Design Basics

1. [What is System Design?](001_what_is_system_design.md)
2. [High Level Design vs Low Level Design](002_high_level_vs_low_level_design.md)
3. [Functional Requirements](003_functional_requirements.md)
4. [Non-Functional Requirements](004_non_functional_requirements.md)
5. [Scalability](005_scalability.md)
6. [Availability](006_availability.md)
7. [Reliability](007_reliability.md)
8. [Latency](008_latency.md)
9. [Throughput](009_throughput.md)
10. [Fault Tolerance](010_fault_tolerance.md)
11. [Maintainability](011_maintainability.md)
12. [Consistency](012_consistency.md)
13. [Durability](013_durability.md)
14. [CAP Theorem](014_cap_theorem.md)
15. [Trade-offs in System Design](015_tradeoffs_in_system_design.md)

## Back-of-the-Envelope Estimation

16. [Estimate Daily Active Users](016_estimate_daily_active_users.md)
17. [Estimate Requests Per Second](017_estimate_requests_per_second.md)
18. [Estimate Peak QPS](018_estimate_peak_qps.md)
19. [Estimate Storage Requirement](019_estimate_storage_requirement.md)
20. [Estimate Bandwidth Requirement](020_estimate_bandwidth_requirement.md)
21. [Estimate Cache Size](021_estimate_cache_size.md)
22. [Estimate Number of Servers](022_estimate_number_of_servers.md)
23. [Estimate Database Size](023_estimate_database_size.md)
24. [Estimate Cost at a High Level](024_estimate_cost_at_a_high_level.md)

## Networking Basics

25. [What Happens When You Type a URL in Browser?](025_what_happens_when_you_type_a_url_in_browser.md)
26. [DNS](026_dns.md)
27. [IP Address](027_ip_address.md)
28. [TCP vs UDP](028_tcp_vs_udp.md)
29. [HTTP vs HTTPS](029_http_vs_https.md)
30. [HTTP Methods](030_http_methods.md)
31. [HTTP Status Codes](031_http_status_codes.md)
32. [REST API](032_rest_api.md)
33. [RPC](033_rpc.md)
34. [GraphQL](034_graphql.md)
35. [WebSockets](035_websockets.md)
36. [Long Polling](036_long_polling.md)
37. [Server-Sent Events](037_server_sent_events.md)

## API Design

38. [Design Good REST APIs](038_design_good_rest_apis.md)
39. [API Versioning](039_api_versioning.md)
40. [Pagination](040_pagination.md)
41. [Filtering and Sorting](041_filtering_and_sorting.md)
42. [Idempotency](042_idempotency.md)
43. [API Rate Limiting](043_api_rate_limiting.md)
44. [API Authentication](044_api_authentication.md)
45. [API Authorization](045_api_authorization.md)
46. [API Gateway](046_api_gateway.md)
47. [Webhooks](047_webhooks.md)
48. [Error Handling in APIs](048_error_handling_in_apis.md)

## Load Balancing

49. [Load Balancer Basics](049_load_balancer_basics.md)
50. [Layer 4 Load Balancing](050_layer_4_load_balancing.md)
51. [Layer 7 Load Balancing](051_layer_7_load_balancing.md)
52. [Round Robin Load Balancing](052_round_robin_load_balancing.md)
53. [Least Connections Load Balancing](053_least_connections_load_balancing.md)
54. [Consistent Hashing Load Balancing](054_consistent_hashing_load_balancing.md)
55. [Sticky Sessions](055_sticky_sessions.md)
56. [Health Checks](056_health_checks.md)
57. [Failover](057_failover.md)
58. [Reverse Proxy](058_reverse_proxy.md)

## Scaling

59. [Vertical Scaling](059_vertical_scaling.md)
60. [Horizontal Scaling](060_horizontal_scaling.md)
61. [Stateless Services](061_stateless_services.md)
62. [Stateful Services](062_stateful_services.md)
63. [Auto Scaling](063_auto_scaling.md)
64. [Database Scaling](064_database_scaling.md)
65. [Read Replicas](065_read_replicas.md)
66. [Write Scaling](066_write_scaling.md)
67. [Sharding](067_sharding.md)
68. [Partitioning](068_partitioning.md)
69. [Hot Partition Problem](069_hot_partition_problem.md)
70. [Fanout](070_fanout.md)
71. [Fanout on Write](071_fanout_on_write.md)
72. [Fanout on Read](072_fanout_on_read.md)

## Databases

73. [SQL vs NoSQL](073_sql_vs_nosql.md)
74. [Relational Database Design](074_relational_database_design.md)
75. [Primary Key](075_primary_key.md)
76. [Foreign Key](076_foreign_key.md)
77. [Indexing](077_indexing.md)
78. [Composite Index](078_composite_index.md)
79. [Database Transactions](079_database_transactions.md)
80. [ACID Properties](080_acid_properties.md)
81. [Isolation Levels](081_isolation_levels.md)
82. [Normalization](082_normalization.md)
83. [Denormalization](083_denormalization.md)
84. [Replication](084_replication.md)
85. [Master-Slave Replication](085_master_slave_replication.md)
86. [Multi-Master Replication](086_multi_master_replication.md)
87. [Database Sharding](087_database_sharding.md)
88. [Consistent Hashing](088_consistent_hashing.md)
89. [Choosing the Right Database](089_choosing_the_right_database.md)
90. [Time Series Database](090_time_series_database.md)
91. [Graph Database](091_graph_database.md)
92. [Columnar Database](092_columnar_database.md)
93. [Search Database](093_search_database.md)

## Caching

94. [Cache Basics](094_cache_basics.md)
95. [Client-Side Cache](095_client_side_cache.md)
96. [CDN Cache](096_cdn_cache.md)
97. [Application Cache](097_application_cache.md)
98. [Database Cache](098_database_cache.md)
99. [Cache Aside Pattern](099_cache_aside_pattern.md)
100. [Read Through Cache](100_read_through_cache.md)
101. [Write Through Cache](101_write_through_cache.md)
102. [Write Back Cache](102_write_back_cache.md)
103. [Cache Invalidation](103_cache_invalidation.md)
104. [Cache Eviction Policies](104_cache_eviction_policies.md)
105. [LRU Cache](105_lru_cache.md)
106. [Cache Stampede](106_cache_stampede.md)
107. [Distributed Cache](107_distributed_cache.md)
108. [Redis Use Cases](108_redis_use_cases.md)

## Message Queues and Event Streaming

109. [Synchronous vs Asynchronous Communication](109_synchronous_vs_asynchronous_communication.md)
110. [Message Queue Basics](110_message_queue_basics.md)
111. [Pub/Sub Model](111_pub_sub_model.md)
112. [Kafka Basics](112_kafka_basics.md)
113. [RabbitMQ Basics](113_rabbitmq_basics.md)
114. [Producer Consumer Pattern](114_producer_consumer_pattern.md)
115. [Queue vs Stream](115_queue_vs_stream.md)
116. [Event Ordering](116_event_ordering.md)
117. [Message Retrying](117_message_retrying.md)
118. [Dead Letter Queue](118_dead_letter_queue.md)
119. [Idempotent Consumers](119_idempotent_consumers.md)
120. [At-Least-Once Delivery](120_at_least_once_delivery.md)
121. [At-Most-Once Delivery](121_at_most_once_delivery.md)
122. [Exactly-Once Delivery](122_exactly_once_delivery.md)
123. [Backpressure](123_backpressure.md)

## Storage Systems

124. [File Storage](124_file_storage.md)
125. [Block Storage](125_block_storage.md)
126. [Object Storage](126_object_storage.md)
127. [Amazon S3 Style Storage](127_amazon_s3_style_storage.md)
128. [Blob Storage](128_blob_storage.md)
129. [Metadata Storage](129_metadata_storage.md)
130. [Multipart Upload](130_multipart_upload.md)
131. [Signed URLs](131_signed_urls.md)
132. [Image Upload System](132_image_upload_system.md)
133. [Video Upload System](133_video_upload_system.md)
134. [Video Transcoding Pipeline](134_video_transcoding_pipeline.md)

## CDN and Media Delivery

135. [CDN Basics](135_cdn_basics.md)
136. [Edge Servers](136_edge_servers.md)
137. [CDN Cache Invalidation](137_cdn_cache_invalidation.md)
138. [Static Content Delivery](138_static_content_delivery.md)
139. [Dynamic Content Delivery](139_dynamic_content_delivery.md)
140. [Image Optimization](140_image_optimization.md)
141. [Video Streaming](141_video_streaming.md)
142. [Adaptive Bitrate Streaming](142_adaptive_bitrate_streaming.md)
143. [Live Streaming Basics](143_live_streaming_basics.md)

## Distributed Systems

144. [Distributed System Basics](144_distributed_system_basics.md)
145. [Distributed Consensus](145_distributed_consensus.md)
146. [Leader Election](146_leader_election.md)
147. [Distributed Lock](147_distributed_lock.md)
148. [Quorum](148_quorum.md)
149. [Gossip Protocol](149_gossip_protocol.md)
150. [Vector Clocks](150_vector_clocks.md)
151. [Clock Skew](151_clock_skew.md)
152. [Eventual Consistency](152_eventual_consistency.md)
153. [Strong Consistency](153_strong_consistency.md)
154. [Read Repair](154_read_repair.md)
155. [Write Conflict Resolution](155_write_conflict_resolution.md)
156. [Distributed Transactions](156_distributed_transactions.md)
157. [Two Phase Commit](157_two_phase_commit.md)
158. [Saga Pattern](158_saga_pattern.md)
159. [CQRS](159_cqrs.md)
160. [Event Sourcing](160_event_sourcing.md)

## Reliability and Fault Tolerance

161. [Single Point of Failure](161_single_point_of_failure.md)
162. [Timeouts](162_timeouts.md)
163. [Retries](163_retries.md)
164. [Exponential Backoff](164_exponential_backoff.md)
165. [Circuit Breaker](165_circuit_breaker.md)
166. [Bulkhead Pattern](166_bulkhead_pattern.md)
167. [Graceful Degradation](167_graceful_degradation.md)
168. [Rate Limiting for Protection](168_rate_limiting_for_protection.md)
169. [Disaster Recovery](169_disaster_recovery.md)
170. [Backup and Restore](170_backup_and_restore.md)
171. [Multi-Region Deployment](171_multi_region_deployment.md)
172. [Active-Passive Architecture](172_active_passive_architecture.md)
173. [Active-Active Architecture](173_active_active_architecture.md)
174. [Chaos Testing](174_chaos_testing.md)

## Observability

175. [Logging](175_logging.md)
176. [Metrics](176_metrics.md)
177. [Distributed Tracing](177_distributed_tracing.md)
178. [Monitoring](178_monitoring.md)
179. [Alerting](179_alerting.md)
180. [Dashboards](180_dashboards.md)
181. [Error Budgets](181_error_budgets.md)
182. [SLI](182_sli.md)
183. [SLO](183_slo.md)
184. [SLA](184_sla.md)

## Security

185. [TLS](185_tls.md)
186. [HTTPS](186_https.md)
187. [Authentication](187_authentication.md)
188. [Authorization](188_authorization.md)
189. [Session Based Authentication](189_session_based_authentication.md)
190. [JWT Authentication](190_jwt_authentication.md)
191. [OAuth 2.0](191_oauth_2_0.md)
192. [API Keys](192_api_keys.md)
193. [Secrets Management](193_secrets_management.md)
194. [Encryption at Rest](194_encryption_at_rest.md)
195. [Encryption in Transit](195_encryption_in_transit.md)
196. [PII Protection](196_pii_protection.md)
197. [DDoS Protection](197_ddos_protection.md)
198. [Abuse Prevention](198_abuse_prevention.md)

## Beginner System Design Problems

199. [Design URL Shortener](199_design_url_shortener.md)
200. [Design Pastebin](200_design_pastebin.md)
201. [Design QR Code Generator](201_design_qr_code_generator.md)
202. [Design Rate Limiter](202_design_rate_limiter.md)
203. [Design API Gateway](203_design_api_gateway.md)
204. [Design File Upload Service](204_design_file_upload_service.md)
205. [Design Image Upload Service](205_design_image_upload_service.md)
206. [Design Notification System](206_design_notification_system.md)
207. [Design Email Service](207_design_email_service.md)
208. [Design Feature Flag System](208_design_feature_flag_system.md)
209. [Design Configuration Management System](209_design_configuration_management_system.md)
210. [Design Logging System](210_design_logging_system.md)

## Intermediate System Design Problems

211. [Design Instagram](211_design_instagram.md)
212. [Design Twitter / X](212_design_twitter.md)
213. [Design Facebook News Feed](213_design_facebook_news_feed.md)
214. [Design LinkedIn Feed](214_design_linkedin_feed.md)
215. [Design Reddit](215_design_reddit.md)
216. [Design YouTube](216_design_youtube.md)
217. [Design Netflix](217_design_netflix.md)
218. [Design Spotify](218_design_spotify.md)
219. [Design WhatsApp](219_design_whatsapp.md)
220. [Design Slack](220_design_slack.md)
221. [Design Discord](221_design_discord.md)
222. [Design Zoom](222_design_zoom.md)
223. [Design Google Drive](223_design_google_drive.md)
224. [Design Dropbox](224_design_dropbox.md)
225. [Design Google Photos](225_design_google_photos.md)

## Search and Recommendation Systems

226. [Design Typeahead / Autocomplete](226_design_typeahead_autocomplete.md)
227. [Design Search Engine](227_design_search_engine.md)
228. [Design Web Crawler](228_design_web_crawler.md)
229. [Design News Search](229_design_news_search.md)
230. [Design Product Search](230_design_product_search.md)
231. [Design Recommendation System](231_design_recommendation_system.md)
232. [Design Trending Topics](232_design_trending_topics.md)
233. [Design Personalized Feed](233_design_personalized_feed.md)
234. [Design Ad Click Tracking System](234_design_ad_click_tracking_system.md)

## Location Based Systems

235. [Design Uber / Ola](235_design_uber.md)
236. [Design Google Maps](236_design_google_maps.md)
237. [Design Nearby Friends](237_design_nearby_friends.md)
238. [Design Food Delivery App](238_design_food_delivery_app.md)
239. [Design Location Sharing System](239_design_location_sharing_system.md)
240. [Design Ride Matching System](240_design_ride_matching_system.md)
241. [Design ETA Calculation System](241_design_eta_calculation_system.md)
242. [Design Geohashing Based System](242_design_geohashing_based_system.md)

## E-Commerce and Payments

243. [Design Amazon](243_design_amazon.md)
244. [Design Flipkart](244_design_flipkart.md)
245. [Design Shopping Cart](245_design_shopping_cart.md)
246. [Design Inventory Management System](246_design_inventory_management_system.md)
247. [Design Order Management System](247_design_order_management_system.md)
248. [Design Coupon System](248_design_coupon_system.md)
249. [Design Payment System](249_design_payment_system.md)
250. [Design Wallet System](250_design_wallet_system.md)
251. [Design UPI Style Payment System](251_design_upi_style_payment_system.md)
252. [Design Ledger System](252_design_ledger_system.md)
253. [Design Ticket Booking System](253_design_ticket_booking_system.md)
254. [Design BookMyShow](254_design_bookmyshow.md)

## Data Intensive Systems

255. [Design Analytics Platform](255_design_analytics_platform.md)
256. [Design Metrics Collection System](256_design_metrics_collection_system.md)
257. [Design Distributed Logging System](257_design_distributed_logging_system.md)
258. [Design Real-Time Dashboard](258_design_real_time_dashboard.md)
259. [Design Data Pipeline](259_design_data_pipeline.md)
260. [Design ETL System](260_design_etl_system.md)
261. [Design Data Lake](261_design_data_lake.md)
262. [Design Fraud Detection System](262_design_fraud_detection_system.md)
263. [Design A/B Testing Platform](263_design_ab_testing_platform.md)

## Advanced System Design Problems

264. [Design Distributed Cache](264_design_distributed_cache.md)
265. [Design Redis](265_design_redis.md)
266. [Design Distributed Queue](266_design_distributed_queue.md)
267. [Design Kafka](267_design_kafka.md)
268. [Design Distributed Key-Value Store](268_design_distributed_key_value_store.md)
269. [Design DynamoDB](269_design_dynamodb.md)
270. [Design Cassandra](270_design_cassandra.md)
271. [Design Google Bigtable](271_design_bigtable.md)
272. [Design Elasticsearch](272_design_elasticsearch.md)
273. [Design CDN](273_design_cdn.md)
274. [Design Cloud Storage](274_design_cloud_storage.md)
275. [Design Multi-Region Database](275_design_multi_region_database.md)
276. [Design Distributed Rate Limiter](276_design_distributed_rate_limiter.md)
277. [Design Distributed Scheduler](277_design_distributed_scheduler.md)
278. [Design CI/CD System](278_design_cicd_system.md)
279. [Design Kubernetes Like System](279_design_kubernetes_like_system.md)

## Real-Time Systems

280. [Design Live Chat System](280_design_live_chat_system.md)
281. [Design Multiplayer Game Backend](281_design_multiplayer_game_backend.md)
282. [Design Collaborative Document Editor](282_design_collaborative_document_editor.md)
283. [Design Google Docs](283_design_google_docs.md)
284. [Design Live Streaming Platform](284_design_live_streaming_platform.md)
285. [Design Stock Price Streaming System](285_design_stock_price_streaming_system.md)
286. [Design Online Auction System](286_design_online_auction_system.md)
287. [Design Real-Time Notification System](287_design_real_time_notification_system.md)

## Low Level Design - Optional but Useful

288. [Design Parking Lot](288_design_parking_lot.md)
289. [Design Elevator System](289_design_elevator_system.md)
290. [Design Vending Machine](290_design_vending_machine.md)
291. [Design ATM](291_design_atm.md)
292. [Design Library Management System](292_design_library_management_system.md)
293. [Design Hotel Booking System](293_design_hotel_booking_system.md)
294. [Design Movie Ticket Booking System](294_design_movie_ticket_booking_system.md)
295. [Design Splitwise](295_design_splitwise.md)
296. [Design Chess](296_design_chess.md)
297. [Design Snake and Ladder](297_design_snake_and_ladder.md)
298. [Design Logger](298_design_logger.md)
299. [Design LRU Cache](299_design_lru_cache.md)
300. [Design Coffee Machine](300_design_coffee_machine.md)

---

**Total: 300 problems** across 24 categories.
