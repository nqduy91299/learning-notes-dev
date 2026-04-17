// ============================================================================
// Graph — Solutions + Runner
// ============================================================================
// Run: npx tsx solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

function separator(title: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(` ${title}`);
  console.log("=".repeat(60));
}

// ---------------------------------------------------------------------------
// PREDICT SOLUTIONS
// ---------------------------------------------------------------------------

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
  // Answer: A, B, C, D — standard BFS level-by-level
}

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
  // Answer: [0] — only vertex 0 has in-degree 0
}

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
  // Answer: 4 2 — total adjacency entries is 4, actual edges = 2
}

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
  // Answer: 2 — {A,B,C} and {D}
}

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
  // Answer: 0 → 1 → 2 → 3 — iterative DFS, pushes in reverse so processes in order
}

// ---------------------------------------------------------------------------
// FIX SOLUTIONS
// ---------------------------------------------------------------------------

// Fix 1: BFS distance — need to process level by level, not per node.
function fix1_bfsDistance(
  graph: Map<string, string[]>,
  start: string,
  target: string
): number {
  const queue: [string, number][] = [[start, 0]]; // store distance with each node
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const [node, distance] = queue.shift()!;

    if (node === target) return distance;

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, distance + 1]);
      }
    }
  }
  return -1;
}

// Fix 2: Cycle detection — must skip parent in undirected graph.
function fix2_hasCycle(graph: Map<string, string[]>): boolean {
  const visited = new Set<string>();

  function dfs(node: string, parent: string | null): boolean {
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        // Only a cycle if visited neighbor is NOT the parent
        return true;
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

// Fix 3: Topo sort — must decrement in-degree before checking.
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
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT SOLUTIONS
// ---------------------------------------------------------------------------

// --- Solution 1: Graph class (adjacency list, undirected) ---
class Graph {
  private adjacencyList: Map<string, string[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex: string): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(v1: string, v2: string): void {
    this.addVertex(v1);
    this.addVertex(v2);
    this.adjacencyList.get(v1)!.push(v2);
    this.adjacencyList.get(v2)!.push(v1);
  }

  removeEdge(v1: string, v2: string): void {
    const list1 = this.adjacencyList.get(v1);
    const list2 = this.adjacencyList.get(v2);
    if (list1) this.adjacencyList.set(v1, list1.filter((v) => v !== v2));
    if (list2) this.adjacencyList.set(v2, list2.filter((v) => v !== v1));
  }

  removeVertex(vertex: string): void {
    const neighbors = this.adjacencyList.get(vertex);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const list = this.adjacencyList.get(neighbor);
        if (list) {
          this.adjacencyList.set(
            neighbor,
            list.filter((v) => v !== vertex)
          );
        }
      }
    }
    this.adjacencyList.delete(vertex);
  }

  getNeighbors(vertex: string): string[] {
    return this.adjacencyList.get(vertex) ?? [];
  }

  hasEdge(v1: string, v2: string): boolean {
    return this.adjacencyList.get(v1)?.includes(v2) ?? false;
  }

  getVertices(): string[] {
    return [...this.adjacencyList.keys()];
  }

  display(): void {
    for (const [vertex, neighbors] of this.adjacencyList) {
      console.log(`  ${vertex} → [${neighbors.join(", ")}]`);
    }
  }
}

// --- Solution 2: BFS traversal ---
function bfsTraversal(
  graph: Map<string, string[]>,
  start: string
): string[] {
  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  const result: string[] = [];

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
  return result;
}

// --- Solution 3: DFS traversal (iterative) ---
function dfsTraversal(
  graph: Map<string, string[]>,
  start: string
): string[] {
  const visited = new Set<string>();
  const stack: string[] = [start];
  const result: string[] = [];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);

    const neighbors = graph.get(node) ?? [];
    // Push in reverse order so first neighbor is processed first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i])) {
        stack.push(neighbors[i]);
      }
    }
  }
  return result;
}

// --- Solution 4: Connected components count ---
function countConnectedComponents(
  graph: Map<string, string[]>
): number {
  const visited = new Set<string>();
  let count = 0;

  function dfs(node: string): void {
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
  }

  for (const [node] of graph) {
    if (!visited.has(node)) {
      dfs(node);
      count++;
    }
  }
  return count;
}

// --- Solution 5: Cycle detection in undirected graph ---
function hasCycleUndirected(
  graph: Map<string, string[]>
): boolean {
  const visited = new Set<string>();

  function dfs(node: string, parent: string | null): boolean {
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        return true;
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

// --- Solution 6: Topological sort (Kahn's algorithm) ---
function topologicalSort(
  graph: Map<number, number[]>
): number[] {
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
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  // If not all vertices are in result, there's a cycle
  return result.length === graph.size ? result : [];
}

// --- Solution 7: Number of islands ---
function numIslands(grid: string[][]): number {
  if (grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === "0") return;
    grid[r][c] = "0"; // mark visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}

// --- Solution 8: Course Schedule ---
function canFinishCourses(
  numCourses: number,
  prerequisites: [number, number][]
): boolean {
  const graph = new Map<number, number[]>();
  for (let i = 0; i < numCourses; i++) {
    graph.set(i, []);
  }
  for (const [course, prereq] of prerequisites) {
    graph.get(prereq)!.push(course);
  }

  const sorted = topologicalSort(graph);
  return sorted.length === numCourses;
}

// --- Solution 9: Clone Graph ---
class GraphNode {
  val: number;
  neighbors: GraphNode[];
  constructor(val: number, neighbors: GraphNode[] = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node: GraphNode | null): GraphNode | null {
  if (!node) return null;

  const cloned = new Map<GraphNode, GraphNode>();
  const queue: GraphNode[] = [node];
  cloned.set(node, new GraphNode(node.val));

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of current.neighbors) {
      if (!cloned.has(neighbor)) {
        cloned.set(neighbor, new GraphNode(neighbor.val));
        queue.push(neighbor);
      }
      cloned.get(current)!.neighbors.push(cloned.get(neighbor)!);
    }
  }

  return cloned.get(node)!;
}

// --- Solution 10: Shortest path (unweighted, BFS) ---
function shortestPath(
  graph: Map<string, string[]>,
  start: string,
  end: string
): string[] {
  if (start === end) return [start];

  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, node);
        if (neighbor === end) {
          // Reconstruct path
          const path: string[] = [];
          let current: string | undefined = end;
          while (current !== undefined) {
            path.push(current);
            current = parent.get(current);
          }
          return path.reverse();
        }
        queue.push(neighbor);
      }
    }
  }
  return [];
}

// ============================================================================
// RUNNER
// ============================================================================

function main(): void {
  separator("PREDICT EXERCISES");

  predict1();
  predict2();
  predict3();
  predict4();
  predict5();

  separator("FIX EXERCISES");

  const g1 = new Map<string, string[]>([
    ["A", ["B", "C"]],
    ["B", ["A", "D"]],
    ["C", ["A"]],
    ["D", ["B"]],
  ]);
  console.log("Fix 1 (BFS distance A→D):", fix1_bfsDistance(g1, "A", "D")); // 2

  const noCycle = new Map<string, string[]>([
    ["A", ["B"]],
    ["B", ["A", "C"]],
    ["C", ["B"]],
  ]);
  const yesCycle = new Map<string, string[]>([
    ["A", ["B", "C"]],
    ["B", ["A", "C"]],
    ["C", ["A", "B"]],
  ]);
  console.log("Fix 2 (no cycle):", fix2_hasCycle(noCycle));   // false
  console.log("Fix 2 (yes cycle):", fix2_hasCycle(yesCycle)); // true

  const dag = new Map<number, number[]>([
    [0, [1, 2]],
    [1, [3]],
    [2, [3]],
    [3, []],
  ]);
  console.log("Fix 3 (topo sort):", fix3_topoSort(dag)); // [0, 1, 2, 3] or [0, 2, 1, 3]

  separator("IMPLEMENT 1: Graph Class");

  const g = new Graph();
  g.addVertex("A");
  g.addVertex("B");
  g.addVertex("C");
  g.addVertex("D");
  g.addEdge("A", "B");
  g.addEdge("A", "C");
  g.addEdge("B", "C");
  g.addEdge("C", "D");
  g.display();
  console.log("Has A-B:", g.hasEdge("A", "B")); // true
  g.removeEdge("A", "B");
  console.log("Has A-B after remove:", g.hasEdge("A", "B")); // false
  g.removeVertex("C");
  console.log("After removing C:");
  g.display();

  separator("IMPLEMENT 2: BFS Traversal");

  const g2 = new Map<string, string[]>([
    ["A", ["B", "C"]],
    ["B", ["A", "D", "E"]],
    ["C", ["A", "F"]],
    ["D", ["B"]],
    ["E", ["B", "F"]],
    ["F", ["C", "E"]],
  ]);
  console.log("BFS from A:", bfsTraversal(g2, "A"));

  separator("IMPLEMENT 3: DFS Traversal");

  console.log("DFS from A:", dfsTraversal(g2, "A"));

  separator("IMPLEMENT 4: Connected Components");

  const g4 = new Map<string, string[]>([
    ["A", ["B"]],
    ["B", ["A"]],
    ["C", ["D"]],
    ["D", ["C"]],
    ["E", []],
  ]);
  console.log("Components:", countConnectedComponents(g4)); // 3

  separator("IMPLEMENT 5: Cycle Detection (Undirected)");

  const cyclic = new Map<string, string[]>([
    ["A", ["B", "C"]],
    ["B", ["A", "C"]],
    ["C", ["A", "B"]],
  ]);
  const acyclic = new Map<string, string[]>([
    ["A", ["B"]],
    ["B", ["A", "C"]],
    ["C", ["B"]],
  ]);
  console.log("Triangle (cyclic):", hasCycleUndirected(cyclic));   // true
  console.log("Line (acyclic):", hasCycleUndirected(acyclic));     // false

  separator("IMPLEMENT 6: Topological Sort");

  const dag6 = new Map<number, number[]>([
    [0, [1, 2]],
    [1, [3]],
    [2, [3]],
    [3, []],
  ]);
  console.log("Topo sort:", topologicalSort(dag6));

  const cyclicDag = new Map<number, number[]>([
    [0, [1]],
    [1, [2]],
    [2, [0]],
  ]);
  console.log("Topo sort (cycle):", topologicalSort(cyclicDag)); // []

  separator("IMPLEMENT 7: Number of Islands");

  const grid7 = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
  ];
  console.log("Islands:", numIslands(grid7)); // 3

  separator("IMPLEMENT 8: Course Schedule");

  console.log(
    "4 courses, valid:",
    canFinishCourses(4, [[1, 0], [2, 0], [3, 1], [3, 2]])
  ); // true
  console.log(
    "2 courses, cycle:",
    canFinishCourses(2, [[1, 0], [0, 1]])
  ); // false

  separator("IMPLEMENT 9: Clone Graph");

  const n1 = new GraphNode(1);
  const n2 = new GraphNode(2);
  const n3 = new GraphNode(3);
  const n4 = new GraphNode(4);
  n1.neighbors = [n2, n4];
  n2.neighbors = [n1, n3];
  n3.neighbors = [n2, n4];
  n4.neighbors = [n1, n3];
  const clonedNode = cloneGraph(n1);
  console.log("Original val:", n1.val, "neighbors:", n1.neighbors.map((n) => n.val));
  console.log("Cloned val:", clonedNode?.val, "neighbors:", clonedNode?.neighbors.map((n) => n.val));
  console.log("Is deep copy:", clonedNode !== n1);

  separator("IMPLEMENT 10: Shortest Path");

  const g10 = new Map<string, string[]>([
    ["A", ["B", "C"]],
    ["B", ["A", "D"]],
    ["C", ["A", "E"]],
    ["D", ["B", "E", "F"]],
    ["E", ["C", "D"]],
    ["F", ["D"]],
  ]);
  console.log("Shortest A→F:", shortestPath(g10, "A", "F"));
  console.log("Shortest A→A:", shortestPath(g10, "A", "A"));

  separator("ALL DONE");
}

main();
