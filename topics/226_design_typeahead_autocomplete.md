# Design Typeahead / Autocomplete

> **Category:** Search and Recommendation Systems

---

Design typeahead: as user types, suggest completions.

### Requirements
- **Functional**: top N suggestions per prefix; personalization; trending.
- **Non-functional**: <100ms response; updates as trends change.

### Architecture
```
[Client] -> [API] -> [Trie service]
                     [Personalization]
                     [Trending service]
                              |
                              v
                         [Redis / memory]
```

### Trie (prefix tree)
- Each node = character.
- Children = next characters.
- Top N suggestions at each node.

### Updating
- **Batch** updates from search logs (every hour).
- Train trie offline, push to servers.

### Personalization
- Boost user's past searches.
- Boost user's location.

### Trending
- Recent search volume boost.

### Data size
- Top 1000 suggestions per prefix.
- 26^N prefixes grows fast; prune.

### Key takeaway
Typeahead = **Trie** with top-N suggestions per node + personalization + trending boost.
Updates batched from search logs. Trie in memory for <100ms response.
