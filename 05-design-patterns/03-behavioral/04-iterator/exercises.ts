// ============================================================================
// Iterator Pattern - Exercises
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 12 exercises: 4 predict, 2 fix, 6 implement. No `any` types.
// Tests are commented out -- uncomment to verify solutions.
// ============================================================================

// ============================================================================
// EXERCISE 1 - PREDICT: Basic Iterator Protocol
// ============================================================================
// What does this code output? Write your answer as a comment.

function exercise1_predict(): void {
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
  console.log(result);
  console.log([...range]);
}

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???

// ============================================================================
// EXERCISE 2 - PREDICT: Generator Iterator
// ============================================================================
// What does this code output?

function exercise2_predict(): void {
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
  console.log(results);
}

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 3 - PREDICT: Multiple Iterators on Same Collection
// ============================================================================
// What does this code output?

function exercise3_predict(): void {
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

  console.log(iter1.next().value);
  console.log(iter2.next().value);
  console.log(iter1.next().value);
  console.log(iter2.next().value);
}

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// ============================================================================
// EXERCISE 4 - PREDICT: Iterator with Return and Throw
// ============================================================================
// What does this code output?

function exercise4_predict(): void {
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
  console.log(gen.next());
  console.log(gen.next());
  console.log(gen.return("early"));
  console.log(gen.next());
}

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???
// Line 3 (before object): ???
// Line 3 (object): ???
// Line 4: ???

// ============================================================================
// EXERCISE 5 - FIX: Broken Reverse Iterator
// ============================================================================
// This reverse iterator has bugs. Fix them so the test passes.

interface SimpleIterator<T> {
  next(): T | undefined;
  hasNext(): boolean;
}

class BrokenReverseIterator<T> implements SimpleIterator<T> {
  private position: number;

  constructor(private items: T[]) {
    this.position = items.length; // BUG 1
  }

  next(): T | undefined {
    if (this.hasNext()) {
      return this.items[this.position]; // BUG 2
    }
    return undefined;
  }

  hasNext(): boolean {
    return this.position > 0; // BUG 3 (related to BUG 1)
  }
}

// TEST (uncomment to verify):
// function test_exercise5(): void {
//   const iter = new BrokenReverseIterator([10, 20, 30, 40]);
//   const results: number[] = [];
//   while (iter.hasNext()) {
//     const val = iter.next();
//     if (val !== undefined) results.push(val);
//   }
//   console.assert(
//     JSON.stringify(results) === JSON.stringify([40, 30, 20, 10]),
//     `Expected [40,30,20,10] but got ${JSON.stringify(results)}`
//   );
//   console.log("Exercise 5 passed!");
// }

// ============================================================================
// EXERCISE 6 - FIX: Broken Iterable Class
// ============================================================================
// This class should be iterable with for...of but has bugs. Fix them.

class BrokenRange {
  constructor(
    private start: number,
    private end: number
  ) {}

  // BUG: wrong Symbol and wrong return type structure
  [Symbol.iterator](): Iterator<number> {
    let current = this.end; // BUG: should start from this.start
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (current < end) {
          // BUG: wrong comparison — will skip last value
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

// TEST (uncomment to verify):
// function test_exercise6(): void {
//   const range = new BrokenRange(1, 5);
//   const results: number[] = [];
//   for (const n of range) {
//     results.push(n);
//   }
//   console.assert(
//     JSON.stringify(results) === JSON.stringify([1, 2, 3, 4, 5]),
//     `Expected [1,2,3,4,5] but got ${JSON.stringify(results)}`
//   );
//   console.log("Exercise 6 passed!");
// }

// ============================================================================
// EXERCISE 7 - IMPLEMENT: Custom Iterator Interface
// ============================================================================
// Implement ArrayIterator that iterates forward through an array.

interface MyIterator<T> {
  next(): T | undefined;
  hasNext(): boolean;
  reset(): void;
}

// TODO: Implement ArrayIterator<T> that implements MyIterator<T>
// class ArrayIterator<T> implements MyIterator<T> { ... }

// TEST (uncomment to verify):
// function test_exercise7(): void {
//   const iter = new ArrayIterator(["a", "b", "c"]);
//   console.assert(iter.hasNext() === true);
//   console.assert(iter.next() === "a");
//   console.assert(iter.next() === "b");
//   console.assert(iter.next() === "c");
//   console.assert(iter.hasNext() === false);
//   console.assert(iter.next() === undefined);
//   iter.reset();
//   console.assert(iter.next() === "a");
//   console.log("Exercise 7 passed!");
// }

// ============================================================================
// EXERCISE 8 - IMPLEMENT: Filtered Iterator
// ============================================================================
// Implement a FilteredIterator that wraps another iterator and only
// yields elements matching a predicate.

// TODO: Implement FilteredIterator<T>
// class FilteredIterator<T> implements MyIterator<T> {
//   constructor(private inner: MyIterator<T>, private predicate: (item: T) => boolean) {}
//   ...
// }

// TEST (uncomment to verify):
// function test_exercise8(): void {
//   const inner = new ArrayIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
//   const evenIter = new FilteredIterator(inner, (n: number) => n % 2 === 0);
//   const results: number[] = [];
//   while (evenIter.hasNext()) {
//     const val = evenIter.next();
//     if (val !== undefined) results.push(val);
//   }
//   console.assert(
//     JSON.stringify(results) === JSON.stringify([2, 4, 6, 8, 10]),
//     `Expected [2,4,6,8,10] but got ${JSON.stringify(results)}`
//   );
//   console.log("Exercise 8 passed!");
// }

// ============================================================================
// EXERCISE 9 - IMPLEMENT: Tree with DFS Iterator
// ============================================================================
// Implement a tree node and a depth-first (pre-order) iterator.

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

// TODO: Implement DFSIterator<T> that implements MyIterator<T>
// It should traverse the tree in pre-order (root, then children left to right).
// class DFSIterator<T> implements MyIterator<T> { ... }

// TEST (uncomment to verify):
// function test_exercise9(): void {
//   const tree: TreeNode<string> = {
//     value: "A",
//     children: [
//       {
//         value: "B",
//         children: [
//           { value: "D", children: [] },
//           { value: "E", children: [] },
//         ],
//       },
//       {
//         value: "C",
//         children: [{ value: "F", children: [] }],
//       },
//     ],
//   };
//   const iter = new DFSIterator(tree);
//   const results: string[] = [];
//   while (iter.hasNext()) {
//     const val = iter.next();
//     if (val !== undefined) results.push(val);
//   }
//   console.assert(
//     JSON.stringify(results) === JSON.stringify(["A", "B", "D", "E", "C", "F"]),
//     `Expected [A,B,D,E,C,F] but got ${JSON.stringify(results)}`
//   );
//   console.log("Exercise 9 passed!");
// }

// ============================================================================
// EXERCISE 10 - IMPLEMENT: BFS Iterator
// ============================================================================
// Implement a breadth-first iterator for the same TreeNode structure.

// TODO: Implement BFSIterator<T> that implements MyIterator<T>
// class BFSIterator<T> implements MyIterator<T> { ... }

// TEST (uncomment to verify):
// function test_exercise10(): void {
//   const tree: TreeNode<string> = {
//     value: "A",
//     children: [
//       {
//         value: "B",
//         children: [
//           { value: "D", children: [] },
//           { value: "E", children: [] },
//         ],
//       },
//       {
//         value: "C",
//         children: [{ value: "F", children: [] }],
//       },
//     ],
//   };
//   const iter = new BFSIterator(tree);
//   const results: string[] = [];
//   while (iter.hasNext()) {
//     const val = iter.next();
//     if (val !== undefined) results.push(val);
//   }
//   console.assert(
//     JSON.stringify(results) === JSON.stringify(["A", "B", "C", "D", "E", "F"]),
//     `Expected [A,B,C,D,E,F] but got ${JSON.stringify(results)}`
//   );
//   console.log("Exercise 10 passed!");
// }

// ============================================================================
// EXERCISE 11 - IMPLEMENT: Iterable Collection with Symbol.iterator
// ============================================================================
// Implement a Stack<T> class that is iterable (pops from top to bottom).

// TODO: Implement Stack<T> with push, pop, peek, size, and [Symbol.iterator]
// class Stack<T> {
//   private items: T[] = [];
//   push(item: T): void { ... }
//   pop(): T | undefined { ... }
//   peek(): T | undefined { ... }
//   get size(): number { ... }
//   [Symbol.iterator](): Iterator<T> { ... }  // iterates top to bottom WITHOUT modifying stack
// }

// TEST (uncomment to verify):
// function test_exercise11(): void {
//   const stack = new Stack<number>();
//   stack.push(1);
//   stack.push(2);
//   stack.push(3);
//   const results = [...stack];
//   console.assert(
//     JSON.stringify(results) === JSON.stringify([3, 2, 1]),
//     `Expected [3,2,1] but got ${JSON.stringify(results)}`
//   );
//   // Stack should not be modified
//   console.assert(stack.size === 3, "Stack should still have 3 elements");
//   console.assert(stack.peek() === 3, "Top should still be 3");
//   console.log("Exercise 11 passed!");
// }

// ============================================================================
// EXERCISE 12 - IMPLEMENT: Pagination Iterator with Generator
// ============================================================================
// Implement a generator function that simulates paginated data fetching.

// TODO: Implement paginatedFetch generator
// The function receives a fetchPage callback and pageSize.
// It should yield all items across all pages until a page returns fewer
// items than pageSize (indicating the last page).
//
// function* paginatedFetch<T>(
//   fetchPage: (pageIndex: number, pageSize: number) => T[],
//   pageSize: number
// ): Generator<T, void, unknown> { ... }

// TEST (uncomment to verify):
// function test_exercise12(): void {
//   const allData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
//   const fetchPage = (pageIndex: number, pageSize: number): number[] => {
//     const start = pageIndex * pageSize;
//     return allData.slice(start, start + pageSize);
//   };
//
//   const results: number[] = [];
//   for (const item of paginatedFetch(fetchPage, 3)) {
//     results.push(item);
//   }
//   console.assert(
//     JSON.stringify(results) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
//     `Expected [1..11] but got ${JSON.stringify(results)}`
//   );
//   console.log("Exercise 12 passed!");
// }

// ============================================================================
// Run predict exercises to check output:
// exercise1_predict();
// exercise2_predict();
// exercise3_predict();
// exercise4_predict();
