// =============================================================
// React Patterns - Exercises (Pure TypeScript Simulations)
// =============================================================
// Config: ES2022, strict, ESNext modules. Run: npx tsx exercises.ts
// No `any` types. No JSX. No browser APIs.
// =============================================================

// ── Helpers ──────────────────────────────────────────────────

/** Simulates React's useState as a closure */
function createState<T>(initial: T): { get: () => T; set: (v: T) => void } {
  let value = initial;
  return {
    get: () => value,
    set: (v: T) => { value = v; },
  };
}

// ── EXERCISE 1: Predict Output (HOC) ────────────────────────
// What does this print?

function withPrefix(fn: (s: string) => string, prefix: string) {
  return (s: string) => fn(`${prefix}_${s}`);
}

function shout(s: string): string {
  return s.toUpperCase();
}

const shoutWithHello = withPrefix(shout, "hello");
// console.log(shoutWithHello("world"));

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 2: Predict Output (Custom Hook / Closure) ──────
// What does this print?

function useCounter(initial: number) {
  const state = createState(initial);
  return {
    value: () => state.get(),
    increment: () => state.set(state.get() + 1),
    reset: () => state.set(initial),
  };
}

const counter = useCounter(5);
// counter.increment();
// counter.increment();
// counter.increment();
// counter.reset();
// counter.increment();
// console.log(counter.value());

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 3: Predict Output (Context Simulation) ─────────
// What does this print?

function createContext<T>(defaultValue: T) {
  let current = defaultValue;
  return {
    Provider: (value: T, fn: () => void) => {
      const prev = current;
      current = value;
      fn();
      current = prev;
    },
    useContext: () => current,
  };
}

const ThemeCtx = createContext("light");
const results: string[] = [];

// results.push(ThemeCtx.useContext());
// ThemeCtx.Provider("dark", () => {
//   results.push(ThemeCtx.useContext());
//   ThemeCtx.Provider("blue", () => {
//     results.push(ThemeCtx.useContext());
//   });
//   results.push(ThemeCtx.useContext());
// });
// results.push(ThemeCtx.useContext());
// console.log(results.join(", "));

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 4: Predict Output (Render Props) ───────────────
// What does this print?

function withData<T>(fetcher: () => T, render: (data: T) => string): string {
  const data = fetcher();
  return render(data);
}

// const output = withData(
//   () => [1, 2, 3],
//   (nums) => nums.map(n => n * 2).join("-")
// );
// console.log(output);

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 5: Predict Output (State Reducer) ──────────────
// What does this print?

type ToggleState = { on: boolean; count: number };
type ToggleAction = { type: "toggle" } | { type: "reset" };

function defaultToggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case "toggle": return { on: !state.on, count: state.count + 1 };
    case "reset": return { on: false, count: 0 };
  }
}

function createToggle(reducer: (s: ToggleState, a: ToggleAction) => ToggleState = defaultToggleReducer) {
  let state: ToggleState = { on: false, count: 0 };
  return {
    toggle: () => { state = reducer(state, { type: "toggle" }); },
    reset: () => { state = reducer(state, { type: "reset" }); },
    getState: () => state,
  };
}

// const t = createToggle((state, action) => {
//   if (action.type === "toggle" && state.count >= 2) return state;
//   return defaultToggleReducer(state, action);
// });
// t.toggle(); t.toggle(); t.toggle(); t.toggle();
// console.log(t.getState());

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 6: Fix the Bug (HOC - type preservation) ───────
// The HOC should preserve the return type but it's broken.

function withLogging<A extends unknown[], R>(fn: (...args: A) => R) {
  return (...args: A): void => {  // BUG: should return R, not void
    console.log("args:", args);
    fn(...args);
    // Missing: should return the result
  };
}

// const add = (a: number, b: number) => a + b;
// const loggedAdd = withLogging(add);
// const result6 = loggedAdd(2, 3);
// console.log(`Result: ${result6}`); // Should print "Result: 5", prints "Result: undefined"

// FIX HERE:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 7: Fix the Bug (Context - missing restore) ─────
// Nested providers don't restore context properly on error.

function createSafeContext<T>(defaultValue: T) {
  let current = defaultValue;
  return {
    Provider: (value: T, fn: () => void) => {
      current = value;  // BUG: doesn't save previous value
      fn();
      // BUG: doesn't restore previous value after fn()
    },
    useContext: () => current,
  };
}

// const LangCtx = createSafeContext("en");
// LangCtx.Provider("fr", () => {
//   LangCtx.Provider("de", () => {});
//   // After inner provider, should be "fr" again
//   console.log(LangCtx.useContext()); // Prints "de" instead of "fr"
// });
// console.log(LangCtx.useContext()); // Prints "de" instead of "en"

// FIX HERE:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 8: Fix the Bug (Compound Components) ───────────
// The select group doesn't handle deselection properly.

class BrokenSelectGroup {
  private selected: string | null = null;

  option(value: string) {
    return {
      select: () => { this.selected = value; },
      deselect: () => { this.selected = null; },  // BUG: deselects even if a different option is selected
      isSelected: () => this.selected === value,
    };
  }

  getSelected(): string | null {
    return this.selected;
  }
}

// const group = new BrokenSelectGroup();
// const optA = group.option("A");
// const optB = group.option("B");
// optA.select();      // A is selected
// optB.select();      // B is selected
// optA.deselect();    // Should NOT deselect B, but it does!
// console.log(group.getSelected()); // Prints null instead of "B"

// FIX HERE:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 9: Implement (HOC - withRetry) ─────────────────
// Create a HOC that retries a function up to `maxRetries` times if it throws.

// type WithRetryOptions = { maxRetries: number };
//
// function withRetry<A extends unknown[], R>(
//   fn: (...args: A) => R,
//   options: WithRetryOptions
// ): (...args: A) => R {
//   // YOUR CODE HERE
// }

// TEST:
// let attempts = 0;
// const flaky = () => {
//   attempts++;
//   if (attempts < 3) throw new Error("fail");
//   return "success";
// };
// const reliable = withRetry(flaky, { maxRetries: 5 });
// console.log(reliable()); // "success"
// console.log(attempts);   // 3
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 10: Implement (Render Props - DataFetcher) ─────
// Create a function that simulates a data fetcher with loading/error/success
// states, passing the state to a render callback.

// type FetchState<T> =
//   | { status: "loading" }
//   | { status: "error"; error: string }
//   | { status: "success"; data: T };
//
// function fetchAndRender<T>(
//   fetcher: () => T,
//   render: (state: FetchState<T>) => string
// ): string {
//   // YOUR CODE HERE
//   // 1. Call render with { status: "loading" } first (store it)
//   // 2. Try to call fetcher()
//   // 3. On success: return render with { status: "success", data }
//   // 4. On error: return render with { status: "error", error: message }
// }

// TEST:
// const out1 = fetchAndRender(
//   () => 42,
//   (state) => {
//     if (state.status === "success") return `Got: ${state.data}`;
//     return state.status;
//   }
// );
// console.log(out1); // "Got: 42"
//
// const out2 = fetchAndRender(
//   () => { throw new Error("oops"); },
//   (state) => {
//     if (state.status === "error") return `Error: ${state.error}`;
//     return state.status;
//   }
// );
// console.log(out2); // "Error: oops"
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 11: Implement (Custom Hook - useLocalStorage) ──
// Create a closure-based "hook" that simulates localStorage with an in-memory store.

// function useLocalStorage<T>(key: string, initialValue: T): {
//   get: () => T;
//   set: (value: T) => void;
//   remove: () => void;
// } {
//   // Use a module-level Map as the "storage"
//   // YOUR CODE HERE
// }

// const storage = new Map<string, unknown>(); // shared "localStorage"
// Hint: use this map inside useLocalStorage

// TEST:
// const name = useLocalStorage("name", "Alice");
// console.log(name.get()); // "Alice"
// name.set("Bob");
// console.log(name.get()); // "Bob"
// const name2 = useLocalStorage("name", "Default"); // same key
// console.log(name2.get()); // "Bob" (persisted!)
// name.remove();
// console.log(name.get()); // "Alice" (back to initial)
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 12: Implement (Compound Components - Form) ─────
// Create a compound form builder where fields share validation state.

// interface FormField {
//   getValue: () => string;
//   setValue: (v: string) => void;
//   validate: () => boolean;
//   getError: () => string | null;
// }
//
// interface FormBuilder {
//   textField: (name: string, opts: { required?: boolean; minLength?: number }) => FormField;
//   isValid: () => boolean;
//   getErrors: () => Record<string, string>;
//   getValues: () => Record<string, string>;
// }
//
// function createForm(): FormBuilder {
//   // YOUR CODE HERE
// }

// TEST:
// const form = createForm();
// const username = form.textField("username", { required: true, minLength: 3 });
// const email = form.textField("email", { required: true });
// username.setValue("ab");
// email.setValue("");
// console.log(form.isValid()); // false
// console.log(form.getErrors()); // { username: "minLength", email: "required" }
// username.setValue("alice");
// email.setValue("a@b.com");
// console.log(form.isValid()); // true
// console.log(form.getValues()); // { username: "alice", email: "a@b.com" }
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 13: Implement (Context - multi-context) ────────
// Create a context system that supports multiple named contexts simultaneously.

// interface ContextSystem {
//   createContext: <T>(name: string, defaultValue: T) => {
//     Provider: (value: T, fn: () => void) => void;
//     useContext: () => T;
//   };
// }
//
// function createContextSystem(): ContextSystem {
//   // YOUR CODE HERE
// }

// TEST:
// const system = createContextSystem();
// const ThemeCtx2 = system.createContext("theme", "light");
// const AuthCtx = system.createContext("auth", { user: "anonymous" });
//
// ThemeCtx2.Provider("dark", () => {
//   AuthCtx.Provider({ user: "alice" }, () => {
//     console.log(ThemeCtx2.useContext()); // "dark"
//     console.log(AuthCtx.useContext());   // { user: "alice" }
//   });
//   console.log(AuthCtx.useContext());     // { user: "anonymous" }
// });
// console.log(ThemeCtx2.useContext());     // "light"
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 14: Implement (Props Getter) ───────────────────
// Create a toggle hook that uses the props getter pattern.

// interface TogglePropsInput {
//   onClick?: () => void;
//   [key: string]: unknown;
// }
//
// interface ToggleProps {
//   ariaPressed: boolean;
//   onClick: () => void;
//   [key: string]: unknown;
// }
//
// function useToggle2() {
//   // Returns { isOn, toggle, getTogglerProps, getResetProps }
//   // getTogglerProps merges user's onClick with internal toggle
//   // getResetProps merges user's onClick with internal reset
//   // YOUR CODE HERE
// }

// TEST:
// const { isOn, getTogglerProps, getResetProps } = useToggle2();
// const logs: string[] = [];
// const tProps = getTogglerProps({ onClick: () => logs.push("user-click") });
// tProps.onClick();
// console.log(isOn());       // true
// console.log(tProps.ariaPressed); // wait - this was captured before toggle...
// // The onClick should have toggled it
// console.log(logs);         // ["user-click"]
// const rProps = getResetProps({ onClick: () => logs.push("user-reset") });
// rProps.onClick();
// console.log(isOn());       // false
// console.log(logs);         // ["user-click", "user-reset"]
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 15: Implement (Controlled vs Uncontrolled) ─────
// Create a text input simulation that works in both controlled and uncontrolled mode.

// interface InputConfig {
//   value?: string;                          // if provided, controlled mode
//   defaultValue?: string;                   // if provided (and no value), uncontrolled mode
//   onChange?: (newValue: string) => void;    // called on every change
// }
//
// interface InputHandle {
//   type: (text: string) => void;            // simulates typing
//   getValue: () => string;
//   isControlled: () => boolean;
// }
//
// function createInput(config: InputConfig): InputHandle {
//   // YOUR CODE HERE
//   // Controlled: value always reflects config.value, onChange notifies parent
//   // Uncontrolled: manages own internal state, starts from defaultValue
// }

// TEST (Controlled):
// let external = "hello";
// const controlled = createInput({
//   value: external,
//   onChange: (v) => { external = v; },
// });
// console.log(controlled.isControlled()); // true
// console.log(controlled.getValue());     // "hello"
// controlled.type("world");
// console.log(external);                  // "world"
// // Note: controlled.getValue() still returns "hello" because
// // the parent hasn't re-created the input with the new value

// TEST (Uncontrolled):
// const uncontrolled = createInput({ defaultValue: "start" });
// console.log(uncontrolled.isControlled()); // false
// console.log(uncontrolled.getValue());     // "start"
// uncontrolled.type("changed");
// console.log(uncontrolled.getValue());     // "changed"
// ─────────────────────────────────────────────────────────────

export {};
