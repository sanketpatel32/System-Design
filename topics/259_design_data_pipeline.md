# Design Data Pipeline

> **Category:** Analytics and Data Pipelines

---

A Data Pipeline transports data from source systems to downstream analytics data stores, applying transformations, enrichments, and validations along the way.

### System Requirements
- **Functional Requirements**:
  - Support both real-time streaming and scheduled batch data movement.
  - Provide schema evolution management and data quality validation.
  - Guarantee exactly-once data processing semantics.
- **Non-Functional Requirements**:
  - Scalability: Process petabytes of structured and unstructured data.
  - Fault Tolerance: Auto-recover from node worker crashes without data duplication or loss.
  - Extensibility: Modular architecture supporting plug-and-play sources and sinks.

### System Architecture (Lambda vs Kappa)
```
                                 [ Data Sources ]
                                        |
                                        v
                            [ Distributed Log (Kafka) ]
                                        |
      +---------------------------------+---------------------------------+
      | (Speed Layer)                                                     | (Batch Layer)
      v                                                                   v
[ Real-Time Stream Processor ]                                      [ Batch Storage (S3 / HDFS) ]
(Apache Flink / Spark Streaming)                                    (Apache Spark / Delta Lake)
      |                                                                   |
      v                                                                   v
[ Real-Time Views (Redis/HBase) ]                                   [ Batch Views (Snowflake) ]
      |                                                                   |
      +---------------------------------+---------------------------------+
                                        |
                                        v
                             [ Unified Query Layer ]
```

### Architectural Framework Comparison
| Architecture | Data Flow Model | Primary Frameworks | Pros & Cons |
|---|---|---|---|
| **Lambda Architecture** | Dual path: Speed layer (streaming) + Batch layer (re-indexing) | Storm/Flink + Hadoop/Spark | Accurate batch layer fixes stream drift; complex code duplication across two layers. |
| **Kappa Architecture** | Single stream processing path for both real-time and historical data | Apache Flink / Kafka Streams | Unified codebase; relies on long retention in message log for historical reprocessing. |

### Key takeaway
Modern data pipelines favor Kappa architectures built on durable log stores (Kafka) and stream processors (Flink), eliminating dual-codebase maintenance while ensuring exactly-once processing guarantees.
