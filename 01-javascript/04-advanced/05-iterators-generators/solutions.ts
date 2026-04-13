// ============================================================================
// 05-iterators-generators: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Iterator protocol basics

function solution1() {
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
  console.log(iter.next()); // { value: 10, done: false }
  console.log(iter.next()); // { value: 20, done: false }
  console.log(iter.next()); // { value: 30, done: false }
  console.log(iter.next()); // { value: undefined, done: true }
}

// ANSWER:
// Log 1: { value: 10, done: false }
// Log 2: { value: 20, done: false }
// Log 3: { value: 30, done: false }
// Log 4: { value: undefined, done: true }
//
// Explanation:
// The iterator increments `n` before checking. So n goes 1→2→3→4.
// For n=1,2,3 it returns value = n*10. For n=4 it returns done: true.
// See README → Section 1: The Iterable Protocol

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: for...of and generator return value

function solution2() {
  function* gen() {
    yield 1;
    yield 2;
    return 3;
  }

  const result: number[] = [];
  for (const val of gen()) {
    result.push(val);
  }
  console.log(result); // [1, 2]
}

// ANSWER:
// Log 1: [1, 2]
//
// Explanation:
// `for...of` stops when it sees `done: true` and does NOT include the
// return value. `return 3` produces { value: 3, done: true }, which
// for...of ignores. Only yielded values (1 and 2) are iterated.
// See README → Section 9: Generator Functions (Return value)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: yield* delegation

function solution3() {
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

  console.log([...outer()]); // ["a", "b", "DONE", "c"]
}

// ANSWER:
// Log 1: ["a", "b", "DONE", "c"]
//
// Explanation:
// `yield* inner()` delegates to inner, yielding "a" and "b". The return
// value of inner ("DONE") becomes the result of the yield* expression,
// which is assigned to `result`. Then `yield result` yields "DONE", and
// `yield "c"` yields "c". So the spread is ["a", "b", "DONE", "c"].
// See README → Section 11: Generator Composition — yield* (Return value)

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Passing values into generators via next(value)

function solution4() {
  function* accumulator() {
    let total = 0;
    while (true) {
      const value: number = yield total;
      total += value;
    }
  }

  const acc = accumulator();
  console.log(acc.next());   // { value: 0, done: false }
  console.log(acc.next(10)); // { value: 10, done: false }
  console.log(acc.next(20)); // { value: 30, done: false }
  console.log(acc.next(5));  // { value: 35, done: false }
}

// ANSWER:
// Log 1: { value: 0, done: false }
// Log 2: { value: 10, done: false }
// Log 3: { value: 30, done: false }
// Log 4: { value: 35, done: false }
//
// Explanation:
// 1st next(): runs to `yield total` where total=0, yields 0.
// 2nd next(10): value=10, total=0+10=10, hits yield total, yields 10.
// 3rd next(20): value=20, total=10+20=30, yields 30.
// 4th next(5): value=5, total=30+5=35, yields 35.
// See README → Section 12: Generators as Data Consumers

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: generator.return() and finally blocks

function solution5() {
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
  console.log(g.next());        // { value: 1, done: false }
  console.log(g.return("early")); // "finally" then { value: "early", done: true }
  console.log(g.next());        // { value: undefined, done: true }
}

// ANSWER:
// Log 1: { value: 1, done: false }
// Log 2 (from finally): "finally"
// Log 3 (from g.return): { value: "early", done: true }
// Log 4: { value: undefined, done: true }
//
// Explanation:
// g.next() yields 1. g.return("early") forces the generator to finish,
// but the try...finally ensures the finally block runs first, printing
// "finally". Then it returns { value: "early", done: true }. After that,
// the generator is done — g.next() gives { value: undefined, done: true }.
// See README → Section 13: generator.return()

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Spread operator with custom iterable

function solution6() {
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

  console.log([...obj]); // [30, 20, 10]
}

// ANSWER:
// Log 1: [30, 20, 10]
//
// Explanation:
// The iterator starts at the last index and counts down. The arrow
// function in `next` captures `this` from the surrounding method (which
// is `obj`), so `this.data` works. Items are yielded in reverse order.
// See README → Section 7: The Spread Operator and Destructuring

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: Making an object iterable
//
// Bug: The iterator never returns done: true, so the loop runs forever.
// Fix: Check the index against songs.length and return done: true.

function solution7() {
  const playlist = {
    songs: ["Bohemian Rhapsody", "Stairway to Heaven", "Hotel California"],

    [Symbol.iterator]() {
      let index = 0;
      return {
        next: () => {
          if (index < this.songs.length) {
            return { value: this.songs[index++], done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };

  const result: string[] = [];
  for (const song of playlist) {
    result.push(song as string);
  }
  console.log(result);
  // ["Bohemian Rhapsody", "Stairway to Heaven", "Hotel California"]
}

// Explanation:
// The original iterator never set `done: true`. Without a termination
// condition, for...of loops forever. The fix adds a bounds check:
// when index >= songs.length, return { done: true }.
// See README → Section 4: Making Custom Iterables

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: Generator yield vs return
//
// Bug: `return` instead of `yield` in the loop. `return` terminates
// the generator immediately (done: true), so only the first value appears.

function solution8() {
  function* gen(): Generator<number, void, unknown> {
    for (let i = 1; i <= 5; i++) {
      yield i;
    }
  }

  console.log([...gen()]); // [1, 2, 3, 4, 5]
}

// Explanation:
// `return i` terminates the generator on the first iteration with
// { value: 1, done: true }. Since for...of / spread ignores done:true
// values, only [] or [1] depending on context. The fix is `yield i`
// which pauses and produces the value without terminating.
// See README → Section 9: Generator Functions

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Iterator reusability
//
// Bug: _index is shared state on the object. After first iteration,
// _index stays at 3, so the second iteration starts exhausted.
// Fix: Create a fresh index variable inside [Symbol.iterator]().

function solution9() {
  const repeatable = {
    items: ["x", "y", "z"],

    [Symbol.iterator]() {
      let index = 0;
      return {
        next: () => {
          if (index < this.items.length) {
            return { value: this.items[index++], done: false as const };
          }
          return { value: undefined, done: true as const };
        },
      };
    },
  };

  console.log([...repeatable]); // ["x", "y", "z"]
  console.log([...repeatable]); // ["x", "y", "z"]
}

// Explanation:
// Each call to [Symbol.iterator]() must create a FRESH iterator with
// its own state. The bug used `this._index` which is shared across
// all iterations. The fix uses a local `let index = 0` inside the
// iterator factory, so each new iterator starts from 0.
// See README → Section 4: Making Custom Iterables

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: yield* delegation with generator
//
// Bug: `yield first()` yields the generator OBJECT, not its values.
// Fix: Use `yield*` to delegate to the sub-generators.

function solution10() {
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
    yield* first();
    yield* second();
  }

  console.log([...combined()]); // [1, 2, 3, 4, 5, 6]
}

// Explanation:
// `yield gen()` yields the generator object itself as a single value.
// `yield*` delegates to the generator, yielding each of its values
// one by one. This is generator composition.
// See README → Section 11: Generator Composition — yield*

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Range iterator

interface RangeIterable {
  [Symbol.iterator](): Iterator<number>;
}

function range(start: number, end: number, step?: number): RangeIterable {
  const s = step ?? (start <= end ? 1 : -1);

  return {
    [Symbol.iterator]() {
      let current = start;
      return {
        next() {
          if (s > 0 ? current <= end : current >= end) {
            const value = current;
            current += s;
            return { value, done: false };
          }
          return { value: undefined, done: true } as IteratorResult<number>;
        },
      };
    },
  };
}

// Explanation:
// The range function returns an iterable with a fresh iterator each call.
// The step defaults to 1 (ascending) or -1 (descending). The termination
// condition depends on step direction.
// See README → Section 4: Making Custom Iterables

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Fibonacci generator

function* fibonacci(): Generator<number, void, unknown> {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Explanation:
// An infinite generator that maintains two state variables. Each yield
// produces the current value, then advances the sequence. Because it
// never returns, callers must break out manually.
// See README → Section 10: Generator as Iterable (Fibonacci example)

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Lazy map and filter generators

function* lazyMap<T, U>(
  iterable: Iterable<T>,
  fn: (item: T) => U
): Generator<U, void, unknown> {
  for (const item of iterable) {
    yield fn(item);
  }
}

function* lazyFilter<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T, void, unknown> {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// Explanation:
// These generators transform/filter values on-demand. No intermediate
// arrays are created — each value is processed only when the consumer
// calls next(). This is the essence of lazy evaluation with generators.
// See README → Section 16: Practical Use Cases (Lazy Evaluation)

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: take() generator

function* take<T>(
  iterable: Iterable<T>,
  count: number
): Generator<T, void, unknown> {
  let i = 0;
  for (const item of iterable) {
    if (i >= count) return;
    yield item;
    i++;
  }
}

// Explanation:
// `take` consumes at most `count` items from any iterable, then returns
// (which sets done: true). This works safely with infinite generators
// because it stops pulling values after the limit is reached.
// See README → Section 16: Practical Use Cases (Lazy Evaluation)

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Passing values into a generator — running average

function* runningAverage(): Generator<number, void, number> {
  let total = 0;
  let count = 0;

  // First yield — no meaningful input yet
  let value: number = yield 0;

  while (true) {
    total += value;
    count++;
    value = yield total / count;
  }
}

// Explanation:
// The first next() runs to the initial `yield 0`, producing 0.
// Subsequent next(val) calls feed `val` into the generator. Each time,
// we add it to the running total, increment count, and yield the new
// average. The two-way communication pattern makes generators ideal
// for stateful computations like running statistics.
// See README → Section 12: Generators as Data Consumers

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Iterable class — InfiniteRepeat

class InfiniteRepeat<T> {
  private items: T[];

  constructor(items: T[]) {
    this.items = [...items];
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const items = this.items;
    return {
      next() {
        if (items.length === 0) {
          return { value: undefined as T, done: true };
        }
        const value = items[index % items.length];
        index++;
        return { value, done: false };
      },
    };
  }
}

// Explanation:
// The iterator uses modulo (%) to cycle through the items array
// infinitely. Each call to [Symbol.iterator]() creates a fresh iterator
// with its own index. Callers must use break to avoid infinite loops.
// See README → Section 6: Infinite Iterators

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Generator-based tree traversal

interface TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}

function* inOrder<T>(node: TreeNode<T> | undefined): Generator<T, void, unknown> {
  if (!node) return;
  yield* inOrder(node.left);
  yield node.value;
  yield* inOrder(node.right);
}

// Explanation:
// Recursive generator using yield* for delegation. In-order traversal
// visits left subtree, then root, then right subtree. yield* delegates
// to the recursive generator calls, flattening the recursion into a
// single iterable sequence. This is one of the most elegant uses of
// generator composition.
// See README → Section 11: Generator Composition — yield*

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Async generator — simulated paginated fetch

async function fetchPage(
  page: number
): Promise<{ data: number[]; hasMore: boolean }> {
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
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchPage(page);
    for (const item of result.data) {
      yield item;
    }
    hasMore = result.hasMore;
    page++;
  }
}

// Explanation:
// The async generator fetches pages one at a time, yielding individual
// items from each page. The consumer uses `for await...of` and doesn't
// need to know about pagination. This is a classic use case for async
// generators — abstracting paginated APIs into simple async streams.
// See README → Section 15: Async Generators

// ============================================================================
// Runner — execute all solutions to verify correctness
// ============================================================================

console.log("=== Exercise 1: Iterator protocol basics ===");
solution1();

console.log("\n=== Exercise 2: for...of and generator return value ===");
solution2();

console.log("\n=== Exercise 3: yield* delegation ===");
solution3();

console.log("\n=== Exercise 4: Passing values via next(value) ===");
solution4();

console.log("\n=== Exercise 5: generator.return() and finally ===");
solution5();

console.log("\n=== Exercise 6: Spread with custom iterable ===");
solution6();

console.log("\n=== Exercise 7: Fix — iterable playlist ===");
solution7();

console.log("\n=== Exercise 8: Fix — yield vs return ===");
solution8();

console.log("\n=== Exercise 9: Fix — iterator reusability ===");
solution9();

console.log("\n=== Exercise 10: Fix — yield* delegation ===");
solution10();

console.log("\n=== Exercise 11: range() ===");
console.log([...range(1, 5)]);
console.log([...range(0, 10, 3)]);
console.log([...range(5, 1, -1)]);
console.log([...range(1, 1)]);

console.log("\n=== Exercise 12: fibonacci() ===");
const fib = fibonacci();
const first10: number[] = [];
for (const n of fib) {
  if (first10.length >= 10) break;
  first10.push(n);
}
console.log(first10);

console.log("\n=== Exercise 13: lazyMap & lazyFilter ===");
const nums13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens13 = lazyFilter(nums13, (n) => n % 2 === 0);
const squared13 = lazyMap(evens13, (n) => n * n);
console.log([...squared13]);

console.log("\n=== Exercise 14: take() ===");
function* naturals(): Generator<number, void, unknown> {
  let n = 1;
  while (true) yield n++;
}
console.log([...take(naturals(), 5)]);
console.log([...take([10, 20, 30], 2)]);
console.log([...take([], 5)]);

console.log("\n=== Exercise 15: runningAverage ===");
const avg = runningAverage();
console.log(avg.next());
console.log(avg.next(10));
console.log(avg.next(20));
console.log(avg.next(30));
console.log(avg.next(0));

console.log("\n=== Exercise 16: InfiniteRepeat ===");
const repeater = new InfiniteRepeat(["r", "g", "b"]);
const first7: string[] = [];
for (const color of repeater) {
  if (first7.length >= 7) break;
  first7.push(color);
}
console.log(first7);

console.log("\n=== Exercise 17: inOrder tree traversal ===");
const tree: TreeNode<number> = {
  value: 4,
  left: {
    value: 2,
    left: { value: 1 },
    right: { value: 3 },
  },
  right: {
    value: 6,
    left: { value: 5 },
    right: { value: 7 },
  },
};
console.log([...inOrder(tree)]);

console.log("\n=== Exercise 18: paginatedFetch (async) ===");
(async () => {
  const allItems: number[] = [];
  for await (const item of paginatedFetch()) {
    allItems.push(item);
  }
  console.log(allItems);
})();
