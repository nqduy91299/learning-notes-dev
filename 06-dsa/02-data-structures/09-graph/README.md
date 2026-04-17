# Graph

## Overview

A **graph** is a non-linear data structure consisting of **vertices** (nodes) and **edges**
(connections between vertices). Graphs model relationships between objects and are one of the
most versatile data structures in computer science.

Graphs appear everywhere: social networks, maps, dependency systems, web pages, circuit
design, recommendation engines, and countless other domains.

---

## Core Terminology

### Vertex (Node)

A fundamental unit of a graph. Each vertex can hold data and connects to other vertices
through edges.

```
Vertices: A, B, C, D
```

### Edge

A connection between two vertices. Edges can carry additional information like weight
or direction.

```
Edge: (A, B) — connects vertex A to vertex B
```

### Directed vs Undirected

| Property     | Directed Graph (Digraph)         | Undirected Graph              |
| ------------ | -------------------------------- | ----------------------------- |
| Edge meaning | One-way: A → B                   | Two-way: A — B                |
| Example      | Twitter follow, web links        | Facebook friendship, roads    |
| Edge notation| Ordered pair (A, B)              | Unordered pair {A, B}         |
| Symmetry     | A → B does NOT imply B → A       | A — B implies B — A           |

**Directed graph:**
```
A → B → C
↓       ↑
D ------→
```

**Undirected graph:**
```
A — B — C
|       |
D ------+
```

### Weighted vs Unweighted

- **Weighted**: Each edge has a numeric value (cost, distance, capacity).
- **Unweighted**: All edges are equal — no associated value.

```
Weighted:           Unweighted:
A --5-- B           A --- B
|       |           |     |
3       2           |     |
|       |           |     |
C --1-- D           C --- D
```

### Degree

- **Undirected graph**: Degree of a vertex = number of edges connected to it.
- **Directed graph**:
  - **In-degree**: Number of edges pointing INTO the vertex.
  - **Out-degree**: Number of edges pointing OUT of the vertex.

```
A → B → C
↓       ↑
D ------→

In-degrees:  A=0, B=1, C=2, D=1
Out-degrees: A=2, B=1, C=0, D=1
```

### Path

A sequence of vertices where each adjacent pair is connected by an edge.

```
Path from A to D: A → B → C → D
Path length: 3 (number of edges)
```

### Cycle

A path that starts and ends at the same vertex, visiting at least one other vertex.

```
Cycle: A → B → C → A
```

### Cyclic vs Acyclic

- **Cyclic graph**: Contains at least one cycle.
- **Acyclic graph**: Contains no cycles.

### DAG (Directed Acyclic Graph)

A directed graph with no cycles. Extremely important in:
- Task scheduling
- Build systems (Make, Webpack)
- Version control (Git commit history)
- Data pipelines

```
DAG example (build dependencies):

  main.ts
   ↓    ↓
utils.ts  api.ts
   ↓        ↓
  config.ts ←
```

### Connected vs Disconnected

- **Connected** (undirected): There is a path between every pair of vertices.
- **Disconnected**: At least one pair of vertices has no path between them.
- **Strongly connected** (directed): There is a directed path from every vertex to every other.
- **Weakly connected** (directed): Connected if you ignore edge directions.

### Connected Components

Maximal subsets of vertices such that every pair within the subset is connected.

```
Component 1: {A, B, C}    Component 2: {D, E}
A — B — C                 D — E
```

### Sparse vs Dense

- **Sparse graph**: Few edges relative to vertices. |E| ≈ |V|.
- **Dense graph**: Many edges. |E| ≈ |V|².

---

## Graph Representations

### 1. Adjacency List

Each vertex stores a list of its neighbors. The most common representation.

```
Graph:
A — B
|   |
C — D

Adjacency List:
A: [B, C]
B: [A, D]
C: [A, D]
D: [B, C]
```

**Implementation (TypeScript):**
```typescript
// Using Map
const graph = new Map<string, string[]>();
graph.set("A", ["B", "C"]);
graph.set("B", ["A", "D"]);
graph.set("C", ["A", "D"]);
graph.set("D", ["B", "C"]);
```

**Complexity:**
| Operation          | Time       |
| ------------------ | ---------- |
| Add vertex         | O(1)       |
| Add edge           | O(1)       |
| Remove vertex      | O(V + E)   |
| Remove edge        | O(E)       |
| Check adjacency    | O(degree)  |
| Space              | O(V + E)   |

**Best for**: Sparse graphs, most real-world graphs, traversals.

### 2. Adjacency Matrix

A 2D array where `matrix[i][j] = 1` (or weight) if edge exists from i to j.

```
     A  B  C  D
A  [ 0, 1, 1, 0 ]
B  [ 1, 0, 0, 1 ]
C  [ 1, 0, 0, 1 ]
D  [ 0, 1, 1, 0 ]
```

**Complexity:**
| Operation          | Time   |
| ------------------ | ------ |
| Add vertex         | O(V²)  |
| Add edge           | O(1)   |
| Remove vertex      | O(V²)  |
| Remove edge        | O(1)   |
| Check adjacency    | O(1)   |
| Space              | O(V²)  |

**Best for**: Dense graphs, frequent adjacency checks, small graphs.

### 3. Edge List

A simple list of all edges as pairs (or triples with weight).

```
Edges: [(A,B), (A,C), (B,D), (C,D)]

Weighted: [(A,B,5), (A,C,3), (B,D,2), (C,D,1)]
```

**Complexity:**
| Operation          | Time   |
| ------------------ | ------ |
| Add edge           | O(1)   |
| Remove edge        | O(E)   |
| Check adjacency    | O(E)   |
| Space              | O(E)   |

**Best for**: Algorithms that process all edges (Kruskal's MST), simple storage.

### When to Use Each Representation

| Scenario                        | Best Representation |
| ------------------------------- | ------------------- |
| Sparse graph, traversals        | Adjacency List      |
| Dense graph, quick edge lookup  | Adjacency Matrix    |
| Simple edge processing          | Edge List           |
| Social network                  | Adjacency List      |
| Flight routes (weighted, dense) | Adjacency Matrix    |
| Minimum spanning tree           | Edge List           |

---

## Graph Traversals

### Breadth-First Search (BFS)

Explores neighbors level by level using a **queue**. Visits all vertices at distance `d`
before visiting vertices at distance `d+1`.

**Algorithm:**
1. Start at a source vertex, mark it visited, enqueue it.
2. Dequeue a vertex, process it.
3. Enqueue all unvisited neighbors, mark them visited.
4. Repeat until queue is empty.

```
Graph:
    A
   / \
  B   C
 / \   \
D   E   F

BFS from A: A → B → C → D → E → F
```

**Pseudocode:**
```
BFS(graph, start):
    queue = [start]
    visited = {start}

    while queue is not empty:
        vertex = queue.dequeue()
        process(vertex)

        for each neighbor of vertex:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)
```

**Time**: O(V + E)
**Space**: O(V)

**Use cases**: Shortest path (unweighted), level-order traversal, connected components,
finding if path exists.

### Depth-First Search (DFS)

Explores as far as possible along each branch before backtracking. Uses a **stack**
(or recursion).

**Algorithm:**
1. Start at a source vertex, mark it visited.
2. Visit an unvisited neighbor, mark it, recurse.
3. Backtrack when no unvisited neighbors remain.

```
Graph:
    A
   / \
  B   C
 / \   \
D   E   F

DFS from A (one possible order): A → B → D → E → C → F
```

**Pseudocode (recursive):**
```
DFS(graph, vertex, visited):
    visited.add(vertex)
    process(vertex)

    for each neighbor of vertex:
        if neighbor not in visited:
            DFS(graph, neighbor, visited)
```

**Pseudocode (iterative):**
```
DFS(graph, start):
    stack = [start]
    visited = {}

    while stack is not empty:
        vertex = stack.pop()
        if vertex in visited: continue
        visited.add(vertex)
        process(vertex)

        for each neighbor of vertex:
            if neighbor not in visited:
                stack.push(neighbor)
```

**Time**: O(V + E)
**Space**: O(V)

**Use cases**: Cycle detection, topological sort, pathfinding, maze solving,
connected components.

### BFS vs DFS

| Property            | BFS                  | DFS                   |
| ------------------- | -------------------- | --------------------- |
| Data structure      | Queue                | Stack / Recursion     |
| Order               | Level by level       | Deep first            |
| Shortest path       | Yes (unweighted)     | No                    |
| Memory              | O(width of graph)    | O(depth of graph)     |
| Complete            | Yes                  | Yes (finite graphs)   |
| Good for            | Shortest path, level | Cycle detection, topo |

---

## Connected Components

A connected component is a maximal set of vertices such that there is a path between
every pair.

**Algorithm**: Run BFS or DFS from each unvisited vertex. Each run discovers one component.

```
Graph:
A — B    C — D    E

Components: {A,B}, {C,D}, {E}
Count: 3
```

**Pseudocode:**
```
countComponents(graph):
    visited = {}
    count = 0

    for each vertex in graph:
        if vertex not in visited:
            BFS/DFS(vertex, visited)
            count++

    return count
```

**Time**: O(V + E)

---

## Topological Sort

A linear ordering of vertices in a DAG such that for every directed edge (u, v),
vertex u comes before vertex v.

**Only possible on DAGs.** If the graph has a cycle, topological sort is impossible.

```
DAG:
A → B → D
A → C → D

Topological orders: [A, B, C, D] or [A, C, B, D]
```

### Kahn's Algorithm (BFS-based)

1. Compute in-degree for every vertex.
2. Enqueue all vertices with in-degree 0.
3. While queue is not empty:
   - Dequeue vertex, add to result.
   - For each neighbor, decrement its in-degree.
   - If neighbor's in-degree becomes 0, enqueue it.
4. If result length < V, graph has a cycle.

```
Step by step:
Initial in-degrees: A=0, B=1, C=1, D=2

Queue: [A]         Result: []
Process A → Queue: [B, C]  Result: [A]    (B: 0, C: 0)
Process B → Queue: [C]     Result: [A, B] (D: 1)
Process C → Queue: [D]     Result: [A, B, C] (D: 0)
Process D → Queue: []      Result: [A, B, C, D]
```

**Time**: O(V + E)
**Space**: O(V)

---

## Shortest Path Concepts

### BFS for Unweighted Graphs

BFS naturally finds the shortest path in unweighted graphs because it explores
level by level. The first time BFS reaches a vertex, it has found the shortest path.

```
A — B — C — D
|           |
E — F — G —+

Shortest path A → D:
BFS: A(0) → B(1), E(1) → C(2), F(2) → D(3), G(3)
Shortest: A → B → C → D (length 3)
```

### Dijkstra's Algorithm (Brief)

For **weighted graphs with non-negative weights**. Uses a priority queue (min-heap).

**Key idea**: Always expand the vertex with the smallest known distance.

1. Set distance to source = 0, all others = infinity.
2. Use min-heap, extract vertex with smallest distance.
3. For each neighbor, if `dist[current] + weight < dist[neighbor]`, update.
4. Repeat until heap is empty.

**Time**: O((V + E) log V) with binary heap.

**Not covered in detail here** — see dedicated shortest-path notes.

---

## Cycle Detection

### Undirected Graph

Use DFS. If you encounter a visited vertex that is NOT the parent of the current
vertex, a cycle exists.

```
A — B
|   |
C — D

DFS from A → B → D → C → sees A (not parent D) → CYCLE
```

### Directed Graph

Use DFS with three states: unvisited, in-progress (on current stack), completed.
If you encounter an in-progress vertex, a cycle exists.

```
A → B → C
    ↑   ↓
    + ← D

States during DFS from A:
A(in-progress) → B(in-progress) → C(in-progress) → D(in-progress)
D → B (B is in-progress) → CYCLE DETECTED
```

Alternatively, Kahn's algorithm detects cycles: if the topological sort result
has fewer vertices than the total count, the graph has a cycle.

---

## Common Graph Problems

| Problem                 | Algorithm              | Time         |
| ----------------------- | ---------------------- | ------------ |
| Traversal               | BFS / DFS              | O(V + E)     |
| Shortest path (unwt.)   | BFS                    | O(V + E)     |
| Shortest path (wt.)     | Dijkstra               | O((V+E)logV) |
| Cycle detection          | DFS                    | O(V + E)     |
| Topological sort         | Kahn's / DFS           | O(V + E)     |
| Connected components     | BFS / DFS              | O(V + E)     |
| Number of islands        | BFS / DFS on grid      | O(rows*cols) |
| Course schedule          | Topological sort       | O(V + E)     |
| Clone graph              | BFS / DFS + hash map   | O(V + E)     |

---

## Grid as Graph

Many problems use a 2D grid as an implicit graph:
- Each cell is a vertex.
- Adjacent cells (up, down, left, right) are edges.

```
Grid:          Implicit graph:
1 1 0          (0,0)—(0,1)  (0,2)
1 0 0          |             
0 0 1          (1,0)        (1,2)
                             |
               (2,0)  (2,1) (2,2)
```

No need to build an explicit adjacency list — just check bounds and cell values
during traversal.

---

## Summary

- Graphs are vertices + edges. They can be directed/undirected, weighted/unweighted.
- Adjacency list is the go-to representation for most problems.
- BFS → level-by-level, shortest path in unweighted graphs.
- DFS → deep exploration, cycle detection, topological sort.
- Topological sort works only on DAGs (Kahn's algorithm is BFS-based).
- Cycle detection: DFS with parent tracking (undirected) or state tracking (directed).
- Grids are implicit graphs — no explicit construction needed.
- Practice recognizing when a problem is a graph problem in disguise.
