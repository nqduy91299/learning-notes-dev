// ============================================================================
// Iterator Pattern - Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ============================================================================
// SOLUTION 1 - PREDICT: Basic Iterator Protocol
// ============================================================================
// Output:
// [1, 2, 3]
// [1, 2, 3]
// Each call to [Symbol.iterator]() creates a fresh iterator starting from 1.

function solution1(): void {
  console.log("=== Solution 1: Basic Iterator Protocol ===");
  const range = {
    from: 1,
    to: 3,
    [Symbol.iterator]() {
      let current = this.from;
      const last = this.to;
      return {
        next(): IteratorResult<number> {
          if (current <= last) {
            return { value: current++, done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };

  const result: number[] = [];
  for (const n of range) {
    result.push(n);
  }
  console.log(result); // [1, 2, 3]
  console.log([...range]); // [1, 2, 3]
}

// ============================================================================
// SOLUTION 2 - PREDICT: Generator Iterator
// ============================================================================
// Output: [0, 1, 1, 2, 3, 5, 8]
// First 7 Fibonacci numbers starting from 0.

function solution2(): void {
  console.log("\n=== Solution 2: Generator Iterator ===");
  function* fibonacci(): Generator<number, void, unknown> {
    let a = 0;
    let b = 1;
    while (true) {
      yield a;
      [a, b] = [b, a + b];
    }
  }

  const fib = fibonacci();
  const results: number[] = [];
  for (let i = 0; i < 7; i++) {
    const next = fib.next();
    if (!next.done) {
      results.push(next.value);
    }
  }
  console.log(results); // [0, 1, 1, 2, 3, 5, 8]
}

// ============================================================================
// SOLUTION 3 - PREDICT: Multiple Iterators on Same Collection
// ============================================================================
// Output:
// 10
// 10
// 20
// 20
// Each iterator has independent state. iter1 and iter2 both start at index 0.

function solution3(): void {
  console.log("\n=== Solution 3: Multiple Iterators ===");
  class NumberList {
    private items: number[] = [];

    add(item: number): void {
      this.items.push(item);
    }

    [Symbol.iterator](): Iterator<number> {
      let index = 0;
      const items = this.items;
      return {
        next(): IteratorResult<number> {
          if (index < items.length) {
            return { value: items[index++], done: false };
          }
          return { value: undefined, done: true };
        },
      };
    }
  }

  const list = new NumberList();
  list.add(10);
  list.add(20);
  list.add(30);

  const iter1 = list[Symbol.iterator]();
  const iter2 = list[Symbol.iterator]();

  console.log(iter1.next().value); // 10
  console.log(iter2.next().value); // 10
  console.log(iter1.next().value); // 20
  console.log(iter2.next().value); // 20
}

// ============================================================================
// SOLUTION 4 - PREDICT: Iterator with Return and Throw
// ============================================================================
// Output:
// { value: 1, done: false }
// { value: 2, done: false }
// cleanup
// { value: 'early', done: true }
// { value: undefined, done: true }

function solution4(): void {
  console.log("\n=== Solution 4: Iterator Return/Throw ===");
  function* counter(): Generator<number, string, unknown> {
    try {
      yield 1;
      yield 2;
      yield 3;
    } finally {
      console.log("cleanup");
    }
    return "done";
  }

  const gen = counter();
  console.log(gen.next()); // { value: 1, done: false }
  console.log(gen.next()); // { value: 2, done: false }
  console.log(gen.return("early")); // cleanup, then { value: 'early', done: true }
  console.log(gen.next()); // { value: undefined, done: true }
}

// ============================================================================
// SOLUTION 5 - FIX: Reverse Iterator
// ============================================================================

interface SimpleIterator<T> {
  next(): T | undefined;
  hasNext(): boolean;
}

class FixedReverseIterator<T> implements SimpleIterator<T> {
  private position: number;

  constructor(private items: T[]) {
    this.position = items.length - 1; // FIX 1: start at last valid index
  }

  next(): T | undefined {
    if (this.hasNext()) {
      return this.items[this.position--]; // FIX 2: return then decrement
    }
    return undefined;
  }

  hasNext(): boolean {
    return this.position >= 0; // FIX 3: >= 0 since position is now an index
  }
}

function solution5(): void {
  console.log("\n=== Solution 5: Fixed Reverse Iterator ===");
  const iter = new FixedReverseIterator([10, 20, 30, 40]);
  const results: number[] = [];
  while (iter.hasNext()) {
    const val = iter.next();
    if (val !== undefined) results.push(val);
  }
  console.assert(
    JSON.stringify(results) === JSON.stringify([40, 30, 20, 10]),
    `Expected [40,30,20,10] but got ${JSON.stringify(results)}`
  );
  console.log("Exercise 5 passed!");
}

// ============================================================================
// SOLUTION 6 - FIX: Broken Iterable Class
// ============================================================================

class FixedRange {
  constructor(
    private start: number,
    private end: number
  ) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start; // FIX 1: start from this.start
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          // FIX 2: <= to include the end value
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

function solution6(): void {
  console.log("\n=== Solution 6: Fixed Iterable Range ===");
  const range = new FixedRange(1, 5);
  const results: number[] = [];
  for (const n of range) {
    results.push(n);
  }
  console.assert(
    JSON.stringify(results) === JSON.stringify([1, 2, 3, 4, 5]),
    `Expected [1,2,3,4,5] but got ${JSON.stringify(results)}`
  );
  console.log("Exercise 6 passed!");
}

// ============================================================================
// SOLUTION 7 - IMPLEMENT: ArrayIterator
// ============================================================================

interface MyIterator<T> {
  next(): T | undefined;
  hasNext(): boolean;
  reset(): void;
}

class ArrayIterator<T> implements MyIterator<T> {
  private position = 0;

  constructor(private items: T[]) {}

  next(): T | undefined {
    if (this.hasNext()) {
      return this.items[this.position++];
    }
    return undefined;
  }

  hasNext(): boolean {
    return this.position < this.items.length;
  }

  reset(): void {
    this.position = 0;
  }
}

function solution7(): void {
  console.log("\n=== Solution 7: ArrayIterator ===");
  const iter = new ArrayIterator(["a", "b", "c"]);
  console.assert(iter.hasNext() === true);
  console.assert(iter.next() === "a");
  console.assert(iter.next() === "b");
  console.assert(iter.next() === "c");
  console.assert(iter.hasNext() === false);
  console.assert(iter.next() === undefined);
  iter.reset();
  console.assert(iter.next() === "a");
  console.log("Exercise 7 passed!");
}

// ============================================================================
// SOLUTION 8 - IMPLEMENT: FilteredIterator
// ============================================================================

class FilteredIterator<T> implements MyIterator<T> {
  private buffer: T | undefined = undefined;
  private bufferReady = false;

  constructor(
    private inner: MyIterator<T>,
    private predicate: (item: T) => boolean
  ) {
    this.advance();
  }

  private advance(): void {
    this.bufferReady = false;
    while (this.inner.hasNext()) {
      const val = this.inner.next();
      if (val !== undefined && this.predicate(val)) {
        this.buffer = val;
        this.bufferReady = true;
        return;
      }
    }
  }

  next(): T | undefined {
    if (!this.bufferReady) return undefined;
    const val = this.buffer;
    this.advance();
    return val;
  }

  hasNext(): boolean {
    return this.bufferReady;
  }

  reset(): void {
    this.inner.reset();
    this.advance();
  }
}

function solution8(): void {
  console.log("\n=== Solution 8: FilteredIterator ===");
  const inner = new ArrayIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const evenIter = new FilteredIterator(inner, (n: number) => n % 2 === 0);
  const results: number[] = [];
  while (evenIter.hasNext()) {
    const val = evenIter.next();
    if (val !== undefined) results.push(val);
  }
  console.assert(
    JSON.stringify(results) === JSON.stringify([2, 4, 6, 8, 10]),
    `Expected [2,4,6,8,10] but got ${JSON.stringify(results)}`
  );
  console.log("Exercise 8 passed!");
}

// ============================================================================
// SOLUTION 9 - IMPLEMENT: DFS Iterator
// ============================================================================

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

class DFSIterator<T> implements MyIterator<T> {
  private stack: TreeNode<T>[];

  constructor(private root: TreeNode<T>) {
    this.stack = [root];
  }

  next(): T | undefined {
    if (!this.hasNext()) return undefined;
    const node = this.stack.pop()!;
    // Push children in reverse order so leftmost is processed first
    for (let i = node.children.length - 1; i >= 0; i--) {
      this.stack.push(node.children[i]);
    }
    return node.value;
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  reset(): void {
    this.stack = [this.root];
  }
}

function solution9(): void {
  console.log("\n=== Solution 9: DFS Iterator ===");
  const tree: TreeNode<string> = {
    value: "A",
    children: [
      {
        value: "B",
        children: [
          { value: "D", children: [] },
          { value: "E", children: [] },
        ],
      },
      {
        value: "C",
        children: [{ value: "F", children: [] }],
      },
    ],
  };
  const iter = new DFSIterator(tree);
  const results: string[] = [];
  while (iter.hasNext()) {
    const val = iter.next();
    if (val !== undefined) results.push(val);
  }
  console.assert(
    JSON.stringify(results) === JSON.stringify(["A", "B", "D", "E", "C", "F"]),
    `Expected [A,B,D,E,C,F] but got ${JSON.stringify(results)}`
  );
  console.log("Exercise 9 passed!");
}

// ============================================================================
// SOLUTION 10 - IMPLEMENT: BFS Iterator
// ============================================================================

class BFSIterator<T> implements MyIterator<T> {
  private queue: TreeNode<T>[];

  constructor(private root: TreeNode<T>) {
    this.queue = [root];
  }

  next(): T | undefined {
    if (!this.hasNext()) return undefined;
    const node = this.queue.shift()!;
    for (const child of node.children) {
      this.queue.push(child);
    }
    return node.value;
  }

  hasNext(): boolean {
    return this.queue.length > 0;
  }

  reset(): void {
    this.queue = [this.root];
  }
}

function solution10(): void {
  console.log("\n=== Solution 10: BFS Iterator ===");
  const tree: TreeNode<string> = {
    value: "A",
    children: [
      {
        value: "B",
        children: [
          { value: "D", children: [] },
          { value: "E", children: [] },
        ],
      },
      {
        value: "C",
        children: [{ value: "F", children: [] }],
      },
    ],
  };
  const iter = new BFSIterator(tree);
  const results: string[] = [];
  while (iter.hasNext()) {
    const val = iter.next();
    if (val !== undefined) results.push(val);
  }
  console.assert(
    JSON.stringify(results) === JSON.stringify(["A", "B", "C", "D", "E", "F"]),
    `Expected [A,B,C,D,E,F] but got ${JSON.stringify(results)}`
  );
  console.log("Exercise 10 passed!");
}

// ============================================================================
// SOLUTION 11 - IMPLEMENT: Iterable Stack
// ============================================================================

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  [Symbol.iterator](): Iterator<T> {
    let index = this.items.length - 1;
    const items = this.items;
    return {
      next(): IteratorResult<T> {
        if (index >= 0) {
          return { value: items[index--], done: false };
        }
        return { value: undefined as T, done: true };
      },
    };
  }
}

function solution11(): void {
  console.log("\n=== Solution 11: Iterable Stack ===");
  const stack = new Stack<number>();
  stack.push(1);
  stack.push(2);
  stack.push(3);
  const results = [...stack];
  console.assert(
    JSON.stringify(results) === JSON.stringify([3, 2, 1]),
    `Expected [3,2,1] but got ${JSON.stringify(results)}`
  );
  console.assert(stack.size === 3, "Stack should still have 3 elements");
  console.assert(stack.peek() === 3, "Top should still be 3");
  console.log("Exercise 11 passed!");
}

// ============================================================================
// SOLUTION 12 - IMPLEMENT: Pagination Iterator with Generator
// ============================================================================

function* paginatedFetch<T>(
  fetchPage: (pageIndex: number, pageSize: number) => T[],
  pageSize: number
): Generator<T, void, unknown> {
  let pageIndex = 0;
  while (true) {
    const page = fetchPage(pageIndex, pageSize);
    for (const item of page) {
      yield item;
    }
    if (page.length < pageSize) {
      break;
    }
    pageIndex++;
  }
}

function solution12(): void {
  console.log("\n=== Solution 12: Pagination Generator ===");
  const allData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const fetchPage = (pageIndex: number, pageSize: number): number[] => {
    const start = pageIndex * pageSize;
    return allData.slice(start, start + pageSize);
  };

  const results: number[] = [];
  for (const item of paginatedFetch(fetchPage, 3)) {
    results.push(item);
  }
  console.assert(
    JSON.stringify(results) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    `Expected [1..11] but got ${JSON.stringify(results)}`
  );
  console.log("Exercise 12 passed!");
}

// ============================================================================
// Runner
// ============================================================================

function main(): void {
  console.log("Iterator Pattern - Solutions Runner\n");
  solution1();
  solution2();
  solution3();
  solution4();
  solution5();
  solution6();
  solution7();
  solution8();
  solution9();
  solution10();
  solution11();
  solution12();
  console.log("\n=== All solutions completed! ===");
}

main();
