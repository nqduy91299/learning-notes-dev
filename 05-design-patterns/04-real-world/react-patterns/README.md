# React Patterns in TypeScript

A deep dive into the most important React design patterns. While React uses JSX
and a virtual DOM, the **underlying patterns** are pure programming concepts:
higher-order functions, closures, inversion of control, and composition.

This module teaches each pattern conceptually, shows how it looks in real React
(JSX pseudocode), and then explains how our exercises simulate the same idea in
pure TypeScript running in Node.js.

---

## Table of Contents

1. [Higher-Order Component (HOC) Pattern](#1-higher-order-component-hoc-pattern)
2. [Render Props Pattern](#2-render-props-pattern)
3. [Custom Hooks Pattern](#3-custom-hooks-pattern)
4. [Compound Components Pattern](#4-compound-components-pattern)
5. [Context / Provider Pattern](#5-context--provider-pattern)
6. [Container / Presentational Pattern](#6-container--presentational-pattern)
7. [Controlled vs Uncontrolled Pattern](#7-controlled-vs-uncontrolled-pattern)
8. [State Reducer Pattern](#8-state-reducer-pattern)
9. [Props Getter Pattern](#9-props-getter-pattern)
10. [How We Simulate These in Pure TS](#10-how-we-simulate-these-in-pure-ts)

---

## 1. Higher-Order Component (HOC) Pattern

### Concept

A Higher-Order Component is a **function that takes a component and returns a
new component** with additional behavior. It's the component equivalent of a
higher-order function.

### Real React (JSX pseudocode)

```tsx
// A HOC that adds loading state to any component
function withLoading<P>(WrappedComponent: React.FC<P>) {
  return function EnhancedComponent(props: P & { isLoading: boolean }) {
    if (props.isLoading) return <Spinner />;
    return <WrappedComponent {...props} />;
  };
}

// Usage
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading isLoading={true} users={[]} />
```

### Core Idea

- **Input**: a function (component)
- **Output**: a new function (component) that wraps the original
- The wrapper can intercept props, add state, add side effects, or modify output

### Common Real-World HOCs

- `withAuth(Component)` - redirects if not authenticated
- `withLoading(Component)` - shows spinner while data loads
- `withErrorBoundary(Component)` - catches errors in children
- `React.memo(Component)` - memoizes render output
- Redux's `connect(mapState, mapDispatch)(Component)`

### Pure TS Simulation

A function that wraps another function, adding behavior before/after:

```ts
function withLogging<A extends unknown[], R>(fn: (...args: A) => R) {
  return (...args: A): R => {
    console.log("Calling with:", args);
    const result = fn(...args);
    console.log("Result:", result);
    return result;
  };
}
```

---

## 2. Render Props Pattern

### Concept

A component that takes a **function as a prop** (or as `children`) and calls
that function to determine what to render. This inverts control: the parent
decides *what* to render, the child decides *when* and *with what data*.

### Real React (JSX pseudocode)

```tsx
// A Mouse tracker that exposes position via render prop
function MouseTracker({ render }: { render: (pos: {x: number, y: number}) => JSX.Element }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return render(position);
}

// Usage - the consumer decides how to display the data
<MouseTracker render={({ x, y }) => <p>Mouse at {x}, {y}</p>} />
```

### Core Idea

- The "component" encapsulates **logic** (tracking state, fetching data, etc.)
- It delegates **presentation** to a callback function
- This is **inversion of control** - the library provides data, the user
  decides what to do with it

### Pure TS Simulation

A function that computes data and passes it to a callback:

```ts
function withData<T>(fetcher: () => T, render: (data: T) => string): string {
  const data = fetcher();
  return render(data);
}
```

---

## 3. Custom Hooks Pattern

### Concept

Custom hooks extract **stateful logic** into reusable functions. They use
closures to encapsulate state and expose a controlled API. In React, hooks
like `useState` and `useEffect` provide the primitive building blocks.

### Real React (JSX pseudocode)

```tsx
// Custom hook for form field management
function useField(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  return {
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onBlur: () => setTouched(true),
    touched,
    reset: () => { setValue(initialValue); setTouched(false); },
  };
}

// Usage
function LoginForm() {
  const email = useField('');
  const password = useField('');
  return (
    <form>
      <input {...email} />
      <input {...password} type="password" />
    </form>
  );
}
```

### Core Idea

- **Closures** hold private state
- The hook returns an **API object** (values + setters + helpers)
- Multiple calls create **independent instances** (each closure has its own state)
- Hooks compose: custom hooks can call other custom hooks

### Pure TS Simulation

We simulate `useState` as a closure factory:

```ts
function createState<T>(initial: T) {
  let value = initial;
  return {
    get: () => value,
    set: (next: T) => { value = next; },
  };
}

function useCounter(initial: number) {
  const state = createState(initial);
  return {
    value: () => state.get(),
    increment: () => state.set(state.get() + 1),
    decrement: () => state.set(state.get() - 1),
    reset: () => state.set(initial),
  };
}
```

---

## 4. Compound Components Pattern

### Concept

A set of components that **work together** and share implicit state. The parent
manages state; children access it implicitly (usually via Context). The consumer
gets a declarative, flexible API.

### Real React (JSX pseudocode)

```tsx
// Compound Tab component
const TabContext = createContext<{ activeIndex: number; setActive: (i: number) => void }>(null!);

function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActive] = useState(defaultIndex);
  return (
    <TabContext.Provider value={{ activeIndex, setActive }}>
      {children}
    </TabContext.Provider>
  );
}

function TabList({ children }) { return <div role="tablist">{children}</div>; }

function Tab({ index, children }) {
  const { activeIndex, setActive } = useContext(TabContext);
  return <button onClick={() => setActive(index)} aria-selected={activeIndex === index}>{children}</button>;
}

function TabPanel({ index, children }) {
  const { activeIndex } = useContext(TabContext);
  return activeIndex === index ? <div>{children}</div> : null;
}

// Usage - flexible, declarative API
<Tabs defaultIndex={0}>
  <TabList>
    <Tab index={0}>First</Tab>
    <Tab index={1}>Second</Tab>
  </TabList>
  <TabPanel index={0}>Content 1</TabPanel>
  <TabPanel index={1}>Content 2</TabPanel>
</Tabs>
```

### Core Idea

- A parent manages **shared state**
- Children read/write that state **implicitly** (not via explicit props)
- The consumer composes children freely without wiring state manually

### Pure TS Simulation

A class or object that manages state, with child objects/methods that reference
the parent's state:

```ts
class SelectGroup {
  private selected: string | null = null;
  option(value: string) {
    return {
      select: () => { this.selected = value; },
      isSelected: () => this.selected === value,
    };
  }
}
```

---

## 5. Context / Provider Pattern

### Concept

Context provides a way to pass data through the component tree without
manually threading props at every level. A **Provider** sets the value;
any descendant **Consumer** can read it.

### Real React (JSX pseudocode)

```tsx
const ThemeContext = createContext<'light' | 'dark'>('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Header />   {/* doesn't need theme prop */}
      <Content />  {/* doesn't need theme prop */}
    </ThemeContext.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

### Core Idea

- Solves **prop drilling** - no need to pass data through every intermediate level
- Provider sets the value; Consumers read it
- When the provider value changes, all consumers re-render

### Pure TS Simulation

A global-ish store that functions can read from:

```ts
function createContext<T>(defaultValue: T) {
  let current = defaultValue;
  return {
    Provider: (value: T, fn: () => void) => { const prev = current; current = value; fn(); current = prev; },
    useContext: () => current,
  };
}
```

---

## 6. Container / Presentational Pattern

### Concept

Separate components into two categories:
- **Container** (smart): handles logic, data fetching, state
- **Presentational** (dumb): receives data via props, renders UI

### Real React (JSX pseudocode)

```tsx
// Presentational - pure function of props
function UserCard({ name, avatar, bio }: UserProps) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{bio}</p>
    </div>
  );
}

// Container - handles data fetching
function UserCardContainer({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <Loading />;
  return <UserCard name={user.name} avatar={user.avatar} bio={user.bio} />;
}
```

### Core Idea

- **Separation of concerns**: logic vs presentation
- Presentational components are easy to test (pure functions)
- Containers are reusable with different presentational components
- Modern React prefers hooks over this split, but the concept remains valuable

### Pure TS Simulation

A "formatter" function (presentational) and a "fetcher" function (container):

```ts
// Presentational
function formatUser(user: User): string {
  return `${user.name} (${user.email})`;
}
// Container
function getUserDisplay(id: string): string {
  const user = fetchUser(id); // logic
  return formatUser(user);    // delegates display
}
```

---

## 7. Controlled vs Uncontrolled Pattern

### Concept

- **Controlled**: the parent owns the state and passes it down. The component
  is a pure reflection of external state.
- **Uncontrolled**: the component manages its own internal state. The parent
  can read it via refs or callbacks, but doesn't drive it.

### Real React (JSX pseudocode)

```tsx
// Controlled - parent owns the value
function ControlledInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

// Uncontrolled - component owns its own state
function UncontrolledInput() {
  const ref = useRef<HTMLInputElement>(null);
  const handleSubmit = () => console.log(ref.current?.value);
  return <input ref={ref} defaultValue="" />;
}
```

### Core Idea

- Controlled = **single source of truth** is external
- Uncontrolled = **single source of truth** is internal
- Controlled gives more power to the parent but requires more wiring
- Uncontrolled is simpler but less flexible

### Pure TS Simulation

```ts
// Controlled: caller provides and manages state
function controlledProcess(state: number, input: number): number {
  return state + input; // returns new state, caller stores it
}

// Uncontrolled: manages own state internally
function createUncontrolledCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    peek: () => count,
  };
}
```

---

## 8. State Reducer Pattern

### Concept

The component uses a reducer internally, but **exposes the reducer** to the
consumer, allowing them to intercept and override state transitions. This
gives maximum flexibility without sacrificing the component's internal logic.

### Real React (JSX pseudocode)

```tsx
// Kent C. Dodds' pattern
function useToggle({ reducer = toggleReducer } = {}) {
  const [state, dispatch] = useReducer(reducer, { on: false });
  const toggle = () => dispatch({ type: 'toggle' });
  const reset = () => dispatch({ type: 'reset' });
  return { ...state, toggle, reset };
}

// Consumer overrides behavior: limit toggle count
function App() {
  const [count, setCount] = useState(0);
  const { on, toggle } = useToggle({
    reducer(state, action) {
      if (action.type === 'toggle' && count >= 4) return state; // block!
      return toggleReducer(state, action);
    },
  });
}
```

### Core Idea

- The component provides a **default reducer**
- The consumer can wrap/replace it to **customize state transitions**
- This is the ultimate inversion of control for state

### Pure TS Simulation

A function that accepts a custom reducer to control transitions:

```ts
type Action = { type: string };
type Reducer<S> = (state: S, action: Action) => S;

function createStore<S>(initial: S, reducer: Reducer<S>) {
  let state = initial;
  return {
    dispatch: (action: Action) => { state = reducer(state, action); },
    getState: () => state,
  };
}
```

---

## 9. Props Getter Pattern

### Concept

Instead of returning raw props, a hook returns **getter functions** that
compose the hook's props with the user's props. This prevents accidental
overwriting of critical handlers.

### Real React (JSX pseudocode)

```tsx
function useToggle() {
  const [on, setOn] = useState(false);

  // Instead of returning { onClick: toggle }, return a getter
  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      'aria-pressed': on,
      onClick: () => {
        setOn(prev => !prev);
        onClick?.();  // user's handler is also called
      },
      ...props,
    };
  }

  return { on, getTogglerProps };
}

// Usage - user's onClick is preserved, not overwritten
function App() {
  const { on, getTogglerProps } = useToggle();
  return <button {...getTogglerProps({ onClick: () => console.log('clicked!') })}>
    {on ? 'ON' : 'OFF'}
  </button>;
}
```

### Core Idea

- Getter functions **merge** internal handlers with user-provided handlers
- Prevents the consumer from accidentally breaking the component by overwriting
  a critical prop like `onClick` or `onChange`
- More composable than raw prop objects

### Pure TS Simulation

A function that returns a getter which merges internal config with user config:

```ts
function createClickHandler() {
  let clicks = 0;
  return {
    getProps: (userProps?: { onClick?: () => void }) => ({
      onClick: () => {
        clicks++;
        userProps?.onClick?.();
      },
      clickCount: clicks,
    }),
  };
}
```

---

## 10. How We Simulate These in Pure TS

Since exercises run in Node.js with `npx tsx`, we cannot use JSX or React.
Instead we use **equivalent programming concepts**:

| React Concept     | Pure TS Equivalent                           |
|-------------------|----------------------------------------------|
| Component         | Function that returns a string/object        |
| Props             | Function parameters / object arguments       |
| State (useState)  | Closure variable with getter/setter          |
| Context           | Scoped variable with Provider/Consumer fns   |
| HOC               | Higher-order function                        |
| Render prop       | Callback function parameter                  |
| Hook              | Closure factory returning an API object      |
| Children          | Array of functions/objects                    |
| Re-render         | Calling the function again                   |

The patterns are **identical in structure**. Only the rendering medium differs
(DOM vs console output).

---

## Key Takeaways

1. **HOCs** add cross-cutting concerns via function wrapping
2. **Render Props** invert control by delegating rendering to callbacks
3. **Custom Hooks** extract reusable stateful logic into closures
4. **Compound Components** share implicit state for declarative APIs
5. **Context** eliminates prop drilling via scoped global state
6. **Container/Presentational** separates logic from display
7. **Controlled/Uncontrolled** determines who owns the state
8. **State Reducer** lets consumers customize state transitions
9. **Props Getter** safely merges internal and external handlers

These patterns compose. A real-world component might use a custom hook
(which uses context internally) exposed via a compound component API with
props getters. Understanding each individually lets you combine them
effectively.
