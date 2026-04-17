// ============================================================================
// Graph — Exercises (18 exercises: 5 predict, 3 fix, 10 implement)
// ============================================================================
// Run: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ---------------------------------------------------------------------------
// PREDICT EXERCISES (5) — What does the code output?
// ---------------------------------------------------------------------------

// --- Predict 1 ---
// What does this print?
function predict1(): void {
  const graph = new Map<string, string[]>();
  graph.set("A", ["B", "C"]);
  graph.set("B", ["A", "D"]);
  graph.set("C", ["A"]);
  graph.set("D", ["B"]);

  const visited = new Set<string>();
  const result: string[] = [];
  const queue: string[] = ["A"];
  visited.add("A");

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  console.log("Predict 1:", result.join(", "));
}
// Your prediction: __________
// predict1();

// --- Predict 2 ---
// What does this print?
function predict2(): void {
  const graph = new Map<number, number[]>();
  graph.set(0, [1, 2]);
  graph.set(1, [3]);
  graph.set(2, [3]);
  graph.set(3, []);

  const inDegree = new Map<number, number>();
  for (const [node] of graph) {
    inDegree.set(node, 0);
  }
  for (const [, neighbors] of graph) {
    for (const n of neighbors) {
      inDegree.set(n, (inDegree.get(n) ?? 0) + 1);
    }
  }

  const result: number[] = [];
  for (const [node, deg] of inDegree) {
    if (deg === 0) result.push(node);
  }
  console.log("Predict 2:", result);
}
// Your prediction: __________
// predict2();

// --- Predict 3 ---
// What does this print?
function predict3(): void {
  const adj = new Map<string, string[]>();
  adj.set("X", ["Y", "Z"]);
  adj.set("Y", ["X"]);
  adj.set("Z", ["X"]);

  let edgeCount = 0;
  for (const [, neighbors] of adj) {
    edgeCount += neighbors.length;
  }
  console.log("Predict 3:", edgeCount, edgeCount / 2);
}
// Your prediction: __________
// predict3();

// --- Predict 4 ---
// What does this print?
function predict4(): void {
  const graph = new Map<string, string[]>();
  graph.set("A", ["B"]);
  graph.set("B", ["C"]);
  graph.set("C", []);
  graph.set("D", []);

  const visited = new Set<string>();
  let components = 0;

  function dfs(node: string): void {
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
  }

  for (const [node] of graph) {
    if (!visited.has(node)) {
      dfs(node);
      components++;
    }
  }
  console.log("Predict 4:", components);
}
// Your prediction: __________
// predict4();

// --- Predict 5 ---
// What does this print?
function predict5(): void {
  const matrix = [
    [0, 1, 0, 0],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
  ];

  const path: number[] = [];
  const visited = new Set<number>();
  const stack: number[] = [0];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    path.push(node);
    for (let i = matrix[node].length - 1; i >= 0; i--) {
      if (matrix[node][i] === 1 && !visited.has(i)) {
        stack.push(i);
      }
    }
  }
  console.log("Predict 5:", path.join(" → "));
}
// Your prediction: __________
// predict5();

// ---------------------------------------------------------------------------
// FIX EXERCISES (3) — Find and fix the bug(s)
// ---------------------------------------------------------------------------

// --- Fix 1 ---
// BFS should return shortest distance from start to target, but returns wrong value.
function fix1_bfsDistance(
  graph: Map<string, string[]>,
  start: string,
  target: string
): number {
  const queue: string[] = [start];
  const visited = new Set<string>();
  let distance = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    visited.add(node);

    if (node === target) return distance;

    distance++;

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }
  return -1;
}
// Test:
// const g1 = new Map([["A", ["B", "C"]], ["B", ["A", "D"]], ["C", ["A"]], ["D", ["B"]]]);
// console.log("Fix 1:", fix1_bfsDistance(g1, "A", "D")); // Should be 2

// --- Fix 2 ---
// Cycle detection in undirected graph — always reports cycle even when there is none.
function fix2_hasCycle(graph: Map<string, string[]>): boolean {
  const visited = new Set<string>();

  function dfs(node: string, _parent: string | null): boolean {
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, node)) return true;
      } else {
        return true; // BUG: doesn't check parent
      }
    }
    return false;
  }

  for (const [node] of graph) {
    if (!visited.has(node)) {
      if (dfs(node, null)) return true;
    }
  }
  return false;
}
// Test:
// const noCycle = new Map([["A", ["B"]], ["B", ["A", "C"]], ["C", ["B"]]]);
// console.log("Fix 2:", fix2_hasCycle(noCycle)); // Should be false (no cycle in A-B-C line)

// --- Fix 3 ---
// Topological sort using Kahn's — missing some vertices in output.
function fix3_topoSort(graph: Map<number, number[]>): number[] {
  const inDegree = new Map<number, number>();
  for (const [node] of graph) {
    inDegree.set(node, 0);
  }
  for (const [, neighbors] of graph) {
    for (const n of neighbors) {
      inDegree.set(n, (inDegree.get(n) ?? 0) + 1);
    }
  }

  const queue: number[] = [];
  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node);
  }

  const result: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      // BUG: not decrementing in-degree
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }
  return result;
}
// Test:
// const dag = new Map([[0, [1, 2]], [1, [3]], [2, [3]], [3, []]]);
// console.log("Fix 3:", fix3_topoSort(dag)); // Should be [0, 1, 2, 3] or [0, 2, 1, 3]

// ---------------------------------------------------------------------------
// IMPLEMENT EXERCISES (10)
// ---------------------------------------------------------------------------

// --- Implement 1 ---
// Implement a Graph class using adjacency list (undirected by default).
// Methods: addVertex, addEdge, removeEdge, removeVertex, getNeighbors, hasEdge, display.
class Graph {
  private adjacencyList: Map<string, string[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(_vertex: string): void {
    // TODO
  }

  addEdge(_v1: string, _v2: string): void {
    // TODO: undirected edge
  }

  removeEdge(_v1: string, _v2: string): void {
    // TODO
  }

  removeVertex(_vertex: string): void {
    // TODO: remove vertex and all its edges
  }

  getNeighbors(vertex: string): string[] {
    return this.adjacencyList.get(vertex) ?? [];
  }

  hasEdge(_v1: string, _v2: string): boolean {
    // TODO
    return false;
  }

  getVertices(): string[] {
    return [...this.adjacencyList.keys()];
  }

  display(): void {
    for (const [vertex, neighbors] of this.adjacencyList) {
      console.log(`${vertex} → [${neighbors.join(", ")}]`);
    }
  }
}
// Test:
// const g = new Graph();
// g.addVertex("A"); g.addVertex("B"); g.addVertex("C");
// g.addEdge("A", "B"); g.addEdge("A", "C"); g.addEdge("B", "C");
// g.display();
// console.log("Has A-B:", g.hasEdge("A", "B")); // true
// g.removeEdge("A", "B");
// console.log("Has A-B:", g.hasEdge("A", "B")); // false
// g.removeVertex("C");
// g.display();

// --- Implement 2 ---
// BFS traversal — return array of vertices in BFS order from a start vertex.
function bfsTraversal(
  graph: Map<string, string[]>,
  _start: string
): string[] {
  // TODO
  return [];
}
// Test:
// const g2 = new Map([["A",["B","C"]],["B",["A","D","E"]],["C",["A","F"]],["D",["B"]],["E",["B","F"]],["F",["C","E"]]]);
// console.log("BFS:", bfsTraversal(g2, "A")); // A, B, C, D, E, F

// --- Implement 3 ---
// DFS traversal (iterative) — return array of vertices in DFS order.
function dfsTraversal(
  graph: Map<string, string[]>,
  _start: string
): string[] {
  // TODO
  return [];
}
// Test:
// console.log("DFS:", dfsTraversal(g2, "A")); // varies by implementation

// --- Implement 4 ---
// Count the number of connected components in an undirected graph.
function countConnectedComponents(
  graph: Map<string, string[]>
): number {
  // TODO
  return 0;
}
// Test:
// const g4 = new Map([["A",["B"]],["B",["A"]],["C",["D"]],["D",["C"]],["E",[]]]);
// console.log("Components:", countConnectedComponents(g4)); // 3

// --- Implement 5 ---
// Detect if an undirected graph has a cycle. Return true if cycle exists.
function hasCycleUndirected(
  graph: Map<string, string[]>
): boolean {
  // TODO: use DFS with parent tracking
  return false;
}
// Test:
// const cyclic = new Map([["A",["B","C"]],["B",["A","C"]],["C",["A","B"]]]);
// const acyclic = new Map([["A",["B"]],["B",["A","C"]],["C",["B"]]]);
// console.log("Cyclic:", hasCycleUndirected(cyclic));   // true
// console.log("Acyclic:", hasCycleUndirected(acyclic)); // false

// --- Implement 6 ---
// Topological sort using Kahn's algorithm. Return sorted order or empty array if cycle.
function topologicalSort(
  graph: Map<number, number[]>
): number[] {
  // TODO
  return [];
}
// Test:
// const dag6 = new Map([[0,[1,2]],[1,[3]],[2,[3]],[3,[]]]);
// console.log("Topo sort:", topologicalSort(dag6)); // [0,1,2,3] or [0,2,1,3]

// --- Implement 7 ---
// Number of islands — given a 2D grid of '1' (land) and '0' (water), count islands.
// An island is surrounded by water and formed by connecting adjacent lands horizontally
// or vertically.
function numIslands(grid: string[][]): number {
  // TODO: BFS or DFS on grid
  return 0;
}
// Test:
// const grid7 = [
//   ["1","1","0","0","0"],
//   ["1","1","0","0","0"],
//   ["0","0","1","0","0"],
//   ["0","0","0","1","1"],
// ];
// console.log("Islands:", numIslands(grid7)); // 3

// --- Implement 8 ---
// Course Schedule — given numCourses and prerequisites [course, prereq],
// determine if you can finish all courses (no cycle in dependency graph).
function canFinishCourses(
  numCourses: number,
  prerequisites: [number, number][]
): boolean {
  // TODO: build directed graph, check for cycle using topological sort
  void numCourses;
  void prerequisites;
  return false;
}
// Test:
// console.log("Can finish:", canFinishCourses(4, [[1,0],[2,0],[3,1],[3,2]])); // true
// console.log("Can finish:", canFinishCourses(2, [[1,0],[0,1]]));             // false (cycle)

// --- Implement 9 ---
// Clone Graph — given a node in a connected undirected graph, return a deep copy.
class GraphNode {
  val: number;
  neighbors: GraphNode[];
  constructor(val: number, neighbors: GraphNode[] = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node: GraphNode | null): GraphNode | null {
  // TODO: BFS or DFS with hash map to track cloned nodes
  void node;
  return null;
}
// Test:
// const n1 = new GraphNode(1);
// const n2 = new GraphNode(2);
// const n3 = new GraphNode(3);
// const n4 = new GraphNode(4);
// n1.neighbors = [n2, n4];
// n2.neighbors = [n1, n3];
// n3.neighbors = [n2, n4];
// n4.neighbors = [n1, n3];
// const cloned = cloneGraph(n1);
// console.log("Clone val:", cloned?.val, "neighbors:", cloned?.neighbors.map(n => n.val));
// console.log("Is deep copy:", cloned !== n1);

// --- Implement 10 ---
// Shortest path in unweighted graph — return the shortest path (array of vertices)
// from start to end, or empty array if no path exists.
function shortestPath(
  graph: Map<string, string[]>,
  _start: string,
  _end: string
): string[] {
  // TODO: BFS with parent tracking
  return [];
}
// Test:
// const g10 = new Map([["A",["B","C"]],["B",["A","D"]],["C",["A","E"]],["D",["B","E","F"]],["E",["C","D"]],["F",["D"]]]);
// console.log("Shortest path:", shortestPath(g10, "A", "F")); // ["A","B","D","F"]

// ============================================================================
// Suppress unused warnings
// ============================================================================
void predict1;
void predict2;
void predict3;
void predict4;
void predict5;
void fix1_bfsDistance;
void fix2_hasCycle;
void fix3_topoSort;
void Graph;
void bfsTraversal;
void dfsTraversal;
void countConnectedComponents;
void hasCycleUndirected;
void topologicalSort;
void numIslands;
void canFinishCourses;
void GraphNode;
void cloneGraph;
void shortestPath;
