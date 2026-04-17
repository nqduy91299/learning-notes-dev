# Iterator Pattern

> **Reference**: [Refactoring.Guru - Iterator](https://refactoring.guru/design-patterns/iterator)

## Intent

**Iterator** is a behavioral design pattern that lets you traverse elements of a
collection without exposing its underlying representation (list, stack, tree, etc.).

The pattern extracts the traversal behavior into a separate object called an
**iterator**, decoupling the traversal algorithm from the collection's internal
structure.

## The Problem

Collections are among the most common data types in programming. Under the hood
they may be simple arrays, linked lists, stacks, trees, graphs, or other complex
structures. Regardless of structure, every collection needs a way for clients to
access its elements sequentially.

Adding multiple traversal algorithms directly into a collection class violates
the **Single Responsibility Principle** -- the collection's primary job is
efficient data storage, not traversal logic.

Furthermore, client code that works with different collection types ends up
tightly coupled to each concrete implementation, because every collection
exposes a different access API.

## Structure

```
 ┌─────────────────────┐        ┌────────────────────────┐
 │   <<interface>>      │        │    <<interface>>        │
 │   IterableCollection │        │    Iterator<T>          │
 ├─────────────────────┤        ├────────────────────────┤
 │ createIterator():    │        │ next(): IteratorResult  │
 │   Iterator<T>        │        │ hasNext(): boolean      │
 └────────┬────────────┘        │ reset(): void           │
          │                      └───────────┬────────────┘
          │ implements                       │ implements
 ┌────────▼────────────┐        ┌───────────▼────────────┐
 │ ConcreteCollection   │───────>│ ConcreteIterator        │
 │                      │creates │                         │
 │ - items: T[]         │        │ - collection            │
 │ + createIterator()   │        │ - currentPosition: number│
 │ + getItems(): T[]    │        │ + next()                │
 └──────────────────────┘        │ + hasNext()             │
                                 └─────────────────────────┘
```

### Participants

| Role                   | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| **Iterator**           | Interface declaring `next()`, `hasNext()`, and optionally `reset()` |
| **ConcreteIterator**   | Implements traversal algorithm; tracks current position            |
| **IterableCollection** | Interface declaring a factory method that returns an Iterator      |
| **ConcreteCollection** | Returns a new ConcreteIterator tied to itself                      |
| **Client**             | Works with iterators and collections via their interfaces          |

## Connection to JavaScript's `Symbol.iterator`

JavaScript and TypeScript have **first-class iterator support** via the
[Iteration Protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).

Any object that implements `[Symbol.iterator]()` returning an object with a
`next(): { value: T; done: boolean }` method is **iterable** and can be used
with:

- `for...of` loops
- Spread syntax `[...iterable]`
- Destructuring `const [a, b] = iterable`
- `Array.from(iterable)`
- `yield*` delegation in generators

```typescript
// Making a custom class iterable
class NumberRange {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

for (const n of new NumberRange(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}
```

### Generator Functions as Iterators

Generator functions (`function*`) produce iterators automatically:

```typescript
function* depthFirst<T>(node: TreeNode<T>): Generator<T> {
  yield node.value;
  for (const child of node.children) {
    yield* depthFirst(child);
  }
}
```

## Implementation in TypeScript

### Step 1 -- Define the Iterator interface

```typescript
interface MyIterator<T> {
  next(): T | undefined;
  hasNext(): boolean;
  reset(): void;
}
```

### Step 2 -- Define the Aggregate (Collection) interface

```typescript
interface Aggregate<T> {
  createIterator(): MyIterator<T>;
}
```

### Step 3 -- Implement a ConcreteIterator

```typescript
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
```

### Step 4 -- Implement a ConcreteCollection

```typescript
class WordsCollection implements Aggregate<string> {
  private items: string[] = [];

  addItem(item: string): void {
    this.items.push(item);
  }

  createIterator(): MyIterator<string> {
    return new ArrayIterator<string>([...this.items]);
  }
}
```

## Different Traversal Strategies

The power of the Iterator pattern lies in supporting **multiple traversal
strategies** over the same data structure.

### Forward vs. Reverse

```typescript
class ReverseArrayIterator<T> implements MyIterator<T> {
  private position: number;
  constructor(private items: T[]) {
    this.position = items.length - 1;
  }
  next(): T | undefined {
    if (this.hasNext()) return this.items[this.position--];
    return undefined;
  }
  hasNext(): boolean {
    return this.position >= 0;
  }
  reset(): void {
    this.position = this.items.length - 1;
  }
}
```

### Tree Traversals

| Strategy        | Order                           | Use Case                   |
| --------------- | ------------------------------- | -------------------------- |
| Depth-first     | Pre-order, in-order, post-order | File system walks, parsing |
| Breadth-first   | Level by level                  | Shortest path, level scans |
| Filtered        | Skip elements by predicate      | Search results, queries    |

### Pagination Iterator

A pagination iterator fetches elements in fixed-size pages, useful for API
responses or database queries:

```typescript
class PaginationIterator<T> implements MyIterator<T> {
  private page = 0;
  private indexInPage = 0;
  private currentPage: T[] = [];

  constructor(
    private fetchPage: (page: number, size: number) => T[],
    private pageSize: number
  ) {
    this.currentPage = this.fetchPage(0, pageSize);
  }

  hasNext(): boolean {
    return this.indexInPage < this.currentPage.length;
  }

  next(): T | undefined {
    if (!this.hasNext()) return undefined;
    const item = this.currentPage[this.indexInPage++];
    if (this.indexInPage >= this.currentPage.length) {
      this.page++;
      this.currentPage = this.fetchPage(this.page, this.pageSize);
      this.indexInPage = 0;
    }
    return item;
  }

  reset(): void {
    this.page = 0;
    this.indexInPage = 0;
    this.currentPage = this.fetchPage(0, this.pageSize);
  }
}
```

## When to Use

- You need to traverse a complex data structure (tree, graph) without exposing
  internals.
- You want **multiple traversal algorithms** over the same collection.
- You want a **uniform interface** for traversing different collection types.
- You need **lazy evaluation** -- elements are computed/fetched on demand.
- You want to support **parallel iteration** (multiple independent cursors).

## When NOT to Use

- Simple arrays or lists where a `for` loop suffices.
- The collection is trivial and unlikely to change.
- Performance is critical and the iterator overhead matters.

## Pros and Cons

### Pros

| Benefit                       | Explanation                                          |
| ----------------------------- | ---------------------------------------------------- |
| Single Responsibility         | Traversal logic lives in its own class               |
| Open/Closed                   | New iterators without modifying existing collections |
| Parallel iteration            | Each iterator holds its own state                    |
| Lazy evaluation               | Elements fetched on demand                           |
| Uniform interface             | Client code works with any iterable                  |

### Cons

| Drawback             | Explanation                                              |
| -------------------- | -------------------------------------------------------- |
| Overhead             | Overkill for simple collections                          |
| Performance          | May be slower than direct access for specialized structures |
| Snapshot semantics   | Collection mutation during iteration can cause bugs      |

## Real-World Examples

### Tree Traversals
DOM traversal (`TreeWalker`, `NodeIterator`), AST visitors in compilers,
file-system directory walkers.

### Collection Classes
Java's `Iterable`/`Iterator`, C#'s `IEnumerable`/`IEnumerator`,
Python's `__iter__`/`__next__`, and JavaScript's `Symbol.iterator`.

### Pagination
REST API pagination (cursor-based or offset-based), database result sets,
infinite scroll UIs that fetch pages on demand.

### Generators and Streams
Node.js readable streams, RxJS observables (async iteration),
Python generators, Rust's `Iterator` trait.

## Relations with Other Patterns

| Pattern          | Relationship                                                     |
| ---------------- | ---------------------------------------------------------------- |
| **Composite**    | Iterator traverses Composite trees                               |
| **Factory Method** | Collection subclasses return different iterator types           |
| **Memento**      | Capture and restore iterator state                               |
| **Visitor**      | Iterator + Visitor to traverse and process heterogeneous elements |

## Key Takeaways

1. Iterator **decouples** traversal from collection implementation.
2. TypeScript/JavaScript's `Symbol.iterator` and `for...of` are the
   language-native realization of this pattern.
3. Generator functions (`function*`) provide a concise way to implement
   custom iterators.
4. Multiple iterators can traverse the **same collection simultaneously**
   with independent state.
5. Consider lazy iterators for large or infinite sequences.
