# Graph Database

> **Category:** Databases

---

A graph database stores data as **nodes and relationships (edges)**, optimized for queries
that traverse connections.

### Data model
```
(Alice) -[:KNOWS]-> (Bob) -[:WORKS_AT]-> (Acme)
   |
   | :LIVES_IN
   v
 (NYC)
```

Nodes have labels (User, City), edges have types (KNOWS, WORKS_AT), both have properties.

### Why graphs
Some data is **naturally graph-shaped**:
- Social networks (friend-of-friend).
- Recommendation (users who bought X also bought Y).
- Fraud (rings of connected accounts).
- Routing (maps, network topology).
- Knowledge graphs.

### Queries graphs are great at
- "Friends of friends of Alice who live in NYC."
- "Shortest path from User A to User B."
- "Find cycles" (fraud rings).
- "Common neighbors" (recommendations).

In SQL these become multi-hop JOINs that get slow fast. In a graph DB, traversal is O(degree),
not O(joins).

### Query languages
- **Cypher** (Neo4j): `MATCH (a:User)-[:KNOWS*2]->(fof) RETURN fof`
- **Gremlin** (TinkerPop / Neptune): traversal-based.
- **GQL** (new standard, ISO).

### Popular graph DBs
- **Neo4j** — most popular, full-featured.
- **Amazon Neptune** — managed, supports Gremlin and SPARQL.
- **Dgraph** — distributed, GraphQL-native.
- **ArangoDB** — multi-model (graph + document).
- **TigerGraph** — large-scale analytics.

### When NOT to use a graph
- Simple CRUD without relationships.
- Time-series data.
- Pure key-value access.

### Key takeaway
Use a graph DB when **relationships are the data** — social, recommendation, fraud, routing.
Multi-hop queries that are painful in SQL become natural. For simple CRUD, a relational DB is
simpler.
