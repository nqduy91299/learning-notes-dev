// ============================================================================
// 05-iterators-generators: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/04-advanced/05-iterators-generators/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Iterator protocol basics
//
// What does each console.log print?

function exercise1() {
  const iterable = {
    [Symbol.iterator]() {
      let n = 0;
      return {
        next() {
          n++;
          if (n <= 3) return { value: n * 10, done: false };
          return { value: undefined, done: true };
        },
      };
    },
  };

  const iter = iterable[Symbol.iterator]();
  console.log(iter.next());
  console.log(iter.next());
  console.log(iter.next());
  console.log(iter.next());
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: for...of and generator return value
//
// What does the console.log print?

function exercise2() {
  function* gen() {
    yield 1;
    yield 2;
    return 3;
  }

  const result: number[] = [];
  for (const val of gen()) {
    result.push(val);
  }
  console.log(result);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: yield* delegation
//
// What does the console.log print?

function exercise3() {
  function* inner() {
    yield "a";
    yield "b";
    return "DONE";
  }

  function* outer() {
    const result = yield* inner();
    yield result;
    yield "c";
  }

  console.log([...outer()]);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Passing values into generators via next(value)
//
// What does each console.log print?

function exercise4() {
  function* accumulator() {
    let total = 0;
    while (true) {
      const value: number = yield total;
      total += value;
    }
  }

  const acc = accumulator();
  console.log(acc.next());
  console.log(acc.next(10));
  console.log(acc.next(20));
  console.log(acc.next(5));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: generator.return() and finally blocks
//
// What does each console.log print?

function exercise5() {
  function* gen() {
    try {
      yield 1;
      yield 2;
      yield 3;
    } finally {
      console.log("finally");
    }
  }

  const g = gen();
  console.log(g.next());
  console.log(g.return("early"));
  console.log(g.next());
}

// YOUR ANSWER:
// Log 1: ???
// Log 2 (from finally): ???
// Log 3 (from g.return): ???
// Log 4: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Spread operator with custom iterable
//
// What does the console.log print?

function exercise6() {
  const obj = {
    data: [10, 20, 30],
    [Symbol.iterator]() {
      let idx = this.data.length - 1;
      return {
        next: () => {
          if (idx >= 0) {
            return { value: this.data[idx--], done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };

  console.log([...obj]);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: Making an object iterable
//
// The `playlist` object should be iterable, yielding song names.
// But the code throws "playlist is not iterable". Fix it.

function exercise7() {
  const playlist = {
    songs: ["Bohemian Rhapsody", "Stairway to Heaven", "Hotel California"],

    // FIX THIS: the iterator implementation is incorrect
    [Symbol.iterator]() {
      let index = 0;
      return {
        next: () => {
          return { value: this.songs[index++] };
        },
      };
    },
  };

  const result: string[] = [];
  for (const song of playlist) {
    result.push(song as string);
  }
  console.log(result);
  // Expected: ["Bohemian Rhapsody", "Stairway to Heaven", "Hotel California"]
}

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: Generator yield vs return
//
// This generator should yield all values 1 through 5 when spread.
// But [...gen()] only gives [1]. Fix the generator.

function exercise8() {
  function* gen(): Generator<number, void, unknown> {
    for (let i = 1; i <= 5; i++) {
      return i;
    }
  }

  console.log([...gen()]);
  // Expected: [1, 2, 3, 4, 5]
}

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Iterator reusability
//
// The `repeatable` object should be iterable multiple times,
// but the second spread returns an empty array. Fix it.

function exercise9() {
  const repeatable = {
    items: ["x", "y", "z"],

    // FIX: this creates a single shared iterator
    _index: 0,

    [Symbol.iterator]() {
      return {
        next: () => {
          if (this._index < this.items.length) {
            return { value: this.items[this._index++], done: false as const };
          }
          return { value: undefined, done: true as const };
        },
      };
    },
  };

  console.log([...repeatable]); // Expected: ["x", "y", "z"]
  console.log([...repeatable]); // Expected: ["x", "y", "z"] (should work again!)
}

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: yield* delegation with generator
//
// The composed generator should yield [1, 2, 3, 4, 5, 6].
// But it gives [Generator, Generator] instead. Fix it.

function exercise10() {
  function* first(): Generator<number, void, unknown> {
    yield 1;
    yield 2;
    yield 3;
  }

  function* second(): Generator<number, void, unknown> {
    yield 4;
    yield 5;
    yield 6;
  }

  function* combined(): Generator<number, void, unknown> {
    yield first() as unknown as number;
    yield second() as unknown as number;
  }

  console.log([...combined()]);
  // Expected: [1, 2, 3, 4, 5, 6]
}

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Range iterator
//
// Implement a `range` function that returns an iterable object.
// range(start, end) yields integers from start to end (inclusive).
// range(start, end, step) yields with the given step (default 1).
// The step can be negative if start > end.

interface RangeIterable {
  [Symbol.iterator](): Iterator<number>;
}

function range(_start: number, _end: number, _step?: number): RangeIterable {
  // YOUR CODE HERE
  return {
    [Symbol.iterator]() {
      return {
        next() {
          return { value: undefined, done: true } as IteratorResult<number>;
        },
      };
    },
  };
}

// Uncomment to test:
// console.log([...range(1, 5)]);          // Expected: [1, 2, 3, 4, 5]
// console.log([...range(0, 10, 3)]);      // Expected: [0, 3, 6, 9]
// console.log([...range(5, 1, -1)]);      // Expected: [5, 4, 3, 2, 1]
// console.log([...range(1, 1)]);          // Expected: [1]

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Fibonacci generator
//
// Implement an infinite generator that yields the Fibonacci sequence:
// 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

function* fibonacci(): Generator<number, void, unknown> {
  // YOUR CODE HERE
}

// Uncomment to test:
// const fib = fibonacci();
// const first10: number[] = [];
// for (const n of fib) {
//   if (first10.length >= 10) break;
//   first10.push(n);
// }
// console.log(first10);
// Expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Lazy map and filter generators
//
// Implement `lazyMap` and `lazyFilter` as generator functions that
// transform/filter items lazily from any iterable.

function* lazyMap<T, U>(
  _iterable: Iterable<T>,
  _fn: (item: T) => U
): Generator<U, void, unknown> {
  // YOUR CODE HERE
}

function* lazyFilter<T>(
  _iterable: Iterable<T>,
  _predicate: (item: T) => boolean
): Generator<T, void, unknown> {
  // YOUR CODE HERE
}

// Uncomment to test:
// const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// const evens = lazyFilter(nums, (n) => n % 2 === 0);
// const squared = lazyMap(evens, (n) => n * n);
// console.log([...squared]);
// Expected: [4, 16, 36, 64, 100]

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: take() generator
//
// Implement a generator that yields at most `count` items from an iterable.
// Should work with infinite generators.

function* take<T>(
  _iterable: Iterable<T>,
  _count: number
): Generator<T, void, unknown> {
  // YOUR CODE HERE
}

// Uncomment to test:
// function* naturals(): Generator<number, void, unknown> {
//   let n = 1;
//   while (true) yield n++;
// }
// console.log([...take(naturals(), 5)]); // Expected: [1, 2, 3, 4, 5]
// console.log([...take([10, 20, 30], 2)]); // Expected: [10, 20]
// console.log([...take([], 5)]);           // Expected: []

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Passing values into a generator — running average
//
// Implement a generator that computes a running average.
// Each call to next(value) feeds in a new number.
// The generator yields the current average after incorporating the new value.
// The first next() call (with no meaningful argument) should yield 0.

function* runningAverage(): Generator<number, void, number> {
  // YOUR CODE HERE
  yield 0;
}

// Uncomment to test:
// const avg = runningAverage();
// console.log(avg.next());       // { value: 0, done: false }
// console.log(avg.next(10));     // { value: 10, done: false }
// console.log(avg.next(20));     // { value: 15, done: false }
// console.log(avg.next(30));     // { value: 20, done: false }
// console.log(avg.next(0));      // { value: 15, done: false }

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Iterable class — InfiniteRepeat
//
// Implement a class that is iterable and infinitely repeats
// a given list of items in order (cycling).
// e.g., new InfiniteRepeat(["a", "b"]) → "a", "b", "a", "b", "a", ...

class InfiniteRepeat<T> {
  private items: T[];

  constructor(items: T[]) {
    this.items = [...items];
  }

  [Symbol.iterator](): Iterator<T> {
    // YOUR CODE HERE
    return {
      next() {
        return { value: undefined as T, done: true };
      },
    };
  }
}

// Uncomment to test:
// const repeater = new InfiniteRepeat(["r", "g", "b"]);
// const first7: string[] = [];
// for (const color of repeater) {
//   if (first7.length >= 7) break;
//   first7.push(color);
// }
// console.log(first7);
// Expected: ["r", "g", "b", "r", "g", "b", "r"]

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Generator-based tree traversal
//
// Implement an in-order traversal generator for a binary tree.
// The tree node type is given. Yield values in sorted order (left → root → right).

interface TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}

function* inOrder<T>(node: TreeNode<T> | undefined): Generator<T, void, unknown> {
  // YOUR CODE HERE
  if (node) {
    void node;
  }
}

// Uncomment to test:
// const tree: TreeNode<number> = {
//   value: 4,
//   left: {
//     value: 2,
//     left: { value: 1 },
//     right: { value: 3 },
//   },
//   right: {
//     value: 6,
//     left: { value: 5 },
//     right: { value: 7 },
//   },
// };
// console.log([...inOrder(tree)]);
// Expected: [1, 2, 3, 4, 5, 6, 7]

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Async generator — simulated paginated fetch
//
// Implement an async generator that simulates fetching paginated data.
// `fetchPage(page)` is provided and returns { data: number[], hasMore: boolean }.
// The generator should yield individual items from all pages until hasMore is false.

async function fetchPage(
  page: number
): Promise<{ data: number[]; hasMore: boolean }> {
  // Simulated API response
  const pages: Record<number, number[]> = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8],
  };
  await new Promise((resolve) => setTimeout(resolve, 10));
  const data = pages[page] ?? [];
  return { data, hasMore: page < 3 };
}

async function* paginatedFetch(): AsyncGenerator<number, void, unknown> {
  // YOUR CODE HERE
  void fetchPage;
}

// Uncomment to test:
// (async () => {
//   const allItems: number[] = [];
//   for await (const item of paginatedFetch()) {
//     allItems.push(item);
//   }
//   console.log(allItems);
//   // Expected: [1, 2, 3, 4, 5, 6, 7, 8]
// })();
