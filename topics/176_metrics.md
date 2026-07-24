# Metrics

> **Category:** Observability

---

Metrics are **numeric aggregations of system data measured over intervals of time**. Unlike logs (which describe individual events), metrics provide low-overhead, real-time numeric time-series data used to monitor system performance, track resource utilization, and trigger automated alerts.

### Metric Collection Architecture (Push vs Pull Model)

Metric collection systems scrape scrapable HTTP endpoints (Pull) or ingest UDP telemetry batches (Push) to store time-series data.

```
Pull-Based Metric Architecture (Prometheus Style):
+--------------------+      1. Expose `/metrics` Endpoint      +-----------------------+
| Microservice Node  | <-------------------------------------- | Prometheus TSDB Server|
| (Prometheus Client)| --------------------------------------> | (Periodically Scrapes)|
+--------------------+      2. Returns Text Metrics            +-----------------------+

Push-Based Metric Architecture (StatsD / Datadog Style):
+--------------------+      1. Push UDP Metric Packets         +-----------------------+
| Microservice Node  | --------------------------------------> | Metric Collector      |
| (StatsD Client)    |                                         | (StatsD / OpenTelemetry)|
+--------------------+                                         +-----------------------+
```

### Metric Types Comparison Matrix

| Metric Type | Behavior & Properties | Common Application | Example Metric |
| :--- | :--- | :--- | :--- |
| **Counter** | Monotonically increasing value (only goes up or resets to 0)| Request counts, error counts | `http_requests_total` |
| **Gauge** | Value that fluctuates up and down | CPU usage, RAM memory, active thread count | `node_memory_utilization` |
| **Histogram** | Samples observations into configurable quantile buckets | Request latency distribution, payload sizes | `http_request_duration_seconds_bucket` |
| **Summary** | Calculates client-side quantiles (P50, P90, P99) over sliding windows | Precise latency SLA tracking | `rpc_latency_seconds{quantile="0.99"}` |

### The Four Golden Signals of Monitoring

Google's SRE framework highlights four primary metrics for any system:
1. **Latency**: The time taken to service a request (track P50, P95, and P99 percentiles; avoid averages).
2. **Traffic**: Demand placed on the system (e.g. HTTP requests per second).
3. **Errors**: Rate of requests that fail (e.g. HTTP 5xx error rate).
4. **Saturation**: How full your system resources are (e.g. CPU utilization, memory pressure, queue depth).

### Key Trade-offs & Cardinality Management

- ✅ **Ultra-Low Storage & Bandwidth Overhead**: Storing numeric time-series data requires far less disk space than full text logs.
- ❌ **High Cardinality Risk**: Adding labels with millions of unique values (e.g. `user_id` or `email`) to metrics causes time-series database memory usage to explode. Avoid high-cardinality label values.
### Prometheus Text-Format Metrics Exposition Example

```http
# HELP http_requests_total Total count of HTTP requests processed
# TYPE http_requests_total counter
http_requests_total{method="POST",handler="/checkout",status="200"} 10452
http_requests_total{method="POST",handler="/checkout",status="500"} 12

# HELP http_request_duration_seconds HTTP request latency distribution
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 8912
http_request_duration_seconds_bucket{le="0.1"}  9821
http_request_duration_seconds_bucket{le="0.5"}  10410
http_request_duration_seconds_bucket{le="+Inf"} 10464
```

### Key takeaway

Metrics provide **low-overhead numeric time-series monitoring**, structured around Counters, Gauges, and Histograms to track the **Four Golden Signals (Latency, Traffic, Errors, Saturation)**.
