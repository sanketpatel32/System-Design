# Graph Database

> **Category:** Databases

---

A **Graph Database** is a non-relational database that uses graph structures with nodes, edges, and properties to represent and store data. Graph databases prioritize relationships between entities, enabling fast traversal of complex multi-hop networks without costly relational SQL `JOIN` operations.

### Property graph architecture

```
    (User: Alice) --------[FOLLOWS {since: 2024}]-------> (User: Bob)
          |                                                   |
          |                                                   |
    [LIKES {rating: 5}]                                [PURCHASED]
          |                                                   |
          v                                                   v
   (Product: Laptop) <------[CATEGORY: Tech]-------- (Product: Phone)
```

### Core components of property graphs

1. **Nodes (Vertices)**: Represent domain entities (e.g., Person, Product, Location) containing key-value properties.
2. **Edges (Relationships)**: Represent directional connections between nodes (e.g., `FOLLOWS`, `PURCHASED`, `FRIEND_OF`) with metadata properties.
3. **Index-Free Adjacency**: Nodes maintain direct physical pointers to adjacent neighbor nodes on disk/memory. Traversal time depends only on the number of connected edges, not the total graph size.

### Graph Database vs Relational Comparison

| Feature | Graph Database (Neo4j, Neptune) | Relational Database (SQL) |
| :--- | :--- | :--- |
| **Multi-Hop Traversal**| Fast (O(1) edge pointer traversal per hop) | Slow (O(N^K) performance drop with multi-table JOINs) |
| **Schema Model** | Dynamic schema; add new edge types freely | Rigid schema; requires DDL migrations to alter relationships |
| **Query Language** | Cypher, Gremlin, SPARQL | Standard ANSI SQL |
| **Primary Use Cases**| Social networks, fraud detection, recommendations | Financial ledger, ERP, transactional records |

### Query Mechanics (Cypher)
```cypher
// 2-hop friend recommendation: friends of friends who aren't connected yet
MATCH (me:User {name: "Alice"})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof)
WHERE NOT (me)-[:FOLLOWS]->(fof) AND me <> fof
RETURN fof.name, count(friend) AS mutualConnections
ORDER BY mutualConnections DESC LIMIT 10
```
Traversal cost is proportional to edges *actually visited* — the same query in SQL needs two self-JOINs whose cost explodes with table size regardless of Alice's degree.

### Engineering Considerations
- **Supernode problem**: a node with millions of edges (a celebrity account) makes traversal through it expensive — mitigate with dense-node handling, edge-type partitioning, or capping per-node expansion in traversal APIs.
- **Transactions**: Neo4j offers ACID transactions, but long-running graph traversals should be bounded (page caches warm, queries paginated) to avoid lock contention on hot subgraphs.
- **Sharding graphs is hard**: relationships cross partition boundaries freely, so distributed graph databases (Neptune, JanusGraph) pay a network hop per cross-shard edge — model placement around query locality.
- **Import pipelines**: bulk loaders (LOAD CSV, Neptune bulk import) are 10–100× faster than per-statement inserts; reserve transactional inserts for runtime only.

### Modeling Discipline
Model *things* as nodes and *facts connecting things* as edges — an edge is a first-class queryable entity, not a foreign key. Common trap: encoding attributes as nodes (a `City` node per address) explodes the graph when the attribute is never traversed; keep leaf attributes as node properties instead.

### Key takeaway

Graph databases enable fast multi-hop relationship traversals using index-free adjacency. Use graph databases for social networks, recommendation engines, and fraud detection systems where relationships are first-class entities.
