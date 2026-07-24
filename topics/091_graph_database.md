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
| **Multi-Hop Traversal**| Fast ($O(1)$ edge pointer traversal per hop) | Slow ($O(N^K)$ performance drop with multi-table JOINs) |
| **Schema Model** | Dynamic schema; add new edge types freely | Rigid schema; requires DDL migrations to alter relationships |
| **Query Language** | Cypher, Gremlin, SPARQL | Standard ANSI SQL |
| **Primary Use Cases**| Social networks, fraud detection, recommendations | Financial ledger, ERP, transactional records |

### Key takeaway

Graph databases enable fast multi-hop relationship traversals using index-free adjacency. Use graph databases for social networks, recommendation engines, and fraud detection systems where relationships are first-class entities.
