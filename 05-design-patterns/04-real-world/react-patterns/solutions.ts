// =============================================================
// React Patterns - Solutions
// =============================================================
// Run: npx tsx solutions.ts
// =============================================================

// ── Helpers ──────────────────────────────────────────────────

function createState<T>(initial: T): { get: () => T; set: (v: T) => void } {
  let value = initial;
  return {
    get: () => value,
    set: (v: T) => { value = v; },
  };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

function section(name: string): void {
  console.log(`\n── ${name} ──`);
}

// =============================================================
// EXERCISE 1: Predict Output (HOC)
// =============================================================
section("Exercise 1: HOC - withPrefix");

function withPrefix(fn: (s: string) => string, prefix: string) {
  return (s: string) => fn(`${prefix}_${s}`);
}

function shout(s: string): string {
  return s.toUpperCase();
}

const shoutWithHello = withPrefix(shout, "hello");
const ex1 = shoutWithHello("world");
// Answer: "HELLO_WORLD"
// withPrefix passes "hello_world" to shout, which uppercases it
assert(ex1 === "HELLO_WORLD", `shoutWithHello("world") === "HELLO_WORLD" → got "${ex1}"`);

// =============================================================
// EXERCISE 2: Predict Output (Custom Hook / Closure)
// =============================================================
section("Exercise 2: useCounter closure");

function useCounter(initial: number) {
  const state = createState(initial);
  return {
    value: () => state.get(),
    increment: () => state.set(state.get() + 1),
    reset: () => state.set(initial),
  };
}

const counter = useCounter(5);
counter.increment(); // 6
counter.increment(); // 7
counter.increment(); // 8
counter.reset();     // 5
counter.increment(); // 6
// Answer: 6
assert(counter.value() === 6, `counter.value() === 6 → got ${counter.value()}`);

// =============================================================
// EXERCISE 3: Predict Output (Context Simulation)
// =============================================================
section("Exercise 3: Context nesting");

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

results.push(ThemeCtx.useContext());         // "light"
ThemeCtx.Provider("dark", () => {
  results.push(ThemeCtx.useContext());       // "dark"
  ThemeCtx.Provider("blue", () => {
    results.push(ThemeCtx.useContext());     // "blue"
  });
  results.push(ThemeCtx.useContext());       // "dark" (restored)
});
results.push(ThemeCtx.useContext());         // "light" (restored)
// Answer: "light, dark, blue, dark, light"
const ex3 = results.join(", ");
assert(ex3 === "light, dark, blue, dark, light", `Context nesting → "${ex3}"`);

// =============================================================
// EXERCISE 4: Predict Output (Render Props)
// =============================================================
section("Exercise 4: Render Props");

function withData<T>(fetcher: () => T, render: (data: T) => string): string {
  const data = fetcher();
  return render(data);
}

const output4 = withData(
  () => [1, 2, 3],
  (nums) => nums.map(n => n * 2).join("-")
);
// Answer: "2-4-6"
assert(output4 === "2-4-6", `withData render → "${output4}"`);

// =============================================================
// EXERCISE 5: Predict Output (State Reducer)
// =============================================================
section("Exercise 5: State Reducer pattern");

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

const t = createToggle((state, action) => {
  if (action.type === "toggle" && state.count >= 2) return state;
  return defaultToggleReducer(state, action);
});
t.toggle(); // { on: true, count: 1 }
t.toggle(); // { on: false, count: 2 }
t.toggle(); // blocked (count >= 2)
t.toggle(); // blocked
// Answer: { on: false, count: 2 }
const ex5 = t.getState();
assert(ex5.on === false && ex5.count === 2, `State reducer → on=${ex5.on}, count=${ex5.count}`);

// =============================================================
// EXERCISE 6: Fix the Bug (HOC - return type)
// =============================================================
section("Exercise 6: Fix withLogging");

// Fixed version: returns R instead of void, and returns the result
function withLogging<A extends unknown[], R>(fn: (...args: A) => R) {
  return (...args: A): R => {
    const result = fn(...args);
    return result;
  };
}

const add = (a: number, b: number) => a + b;
const loggedAdd = withLogging(add);
const result6 = loggedAdd(2, 3);
assert(result6 === 5, `withLogging(add)(2,3) === 5 → got ${result6}`);

// =============================================================
// EXERCISE 7: Fix the Bug (Context - missing restore)
// =============================================================
section("Exercise 7: Fix context restore");

// Fixed: save and restore previous value
function createSafeContext<T>(defaultValue: T) {
  let current = defaultValue;
  return {
    Provider: (value: T, fn: () => void) => {
      const prev = current;  // FIX: save previous
      current = value;
      fn();
      current = prev;        // FIX: restore previous
    },
    useContext: () => current,
  };
}

const LangCtx = createSafeContext("en");
let langAfterInner = "";
let langAfterOuter = "";
LangCtx.Provider("fr", () => {
  LangCtx.Provider("de", () => {});
  langAfterInner = LangCtx.useContext();
});
langAfterOuter = LangCtx.useContext();
assert(langAfterInner === "fr", `After inner provider: "${langAfterInner}" === "fr"`);
assert(langAfterOuter === "en", `After outer provider: "${langAfterOuter}" === "en"`);

// =============================================================
// EXERCISE 8: Fix the Bug (Compound Components - deselect)
// =============================================================
section("Exercise 8: Fix SelectGroup deselect");

// Fixed: deselect only if THIS option is the one selected
class FixedSelectGroup {
  private selected: string | null = null;

  option(value: string) {
    return {
      select: () => { this.selected = value; },
      deselect: () => {
        if (this.selected === value) {  // FIX: only deselect if we're the selected one
          this.selected = null;
        }
      },
      isSelected: () => this.selected === value,
    };
  }

  getSelected(): string | null {
    return this.selected;
  }
}

const group = new FixedSelectGroup();
const optA = group.option("A");
const optB = group.option("B");
optA.select();
optB.select();
optA.deselect();  // Should NOT deselect B
assert(group.getSelected() === "B", `After A.deselect(), selected is still "B" → got "${group.getSelected()}"`);

// =============================================================
// EXERCISE 9: Implement (HOC - withRetry)
// =============================================================
section("Exercise 9: withRetry");

type WithRetryOptions = { maxRetries: number };

function withRetry<A extends unknown[], R>(
  fn: (...args: A) => R,
  options: WithRetryOptions
): (...args: A) => R {
  return (...args: A): R => {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return fn(...args);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }
    throw lastError;
  };
}

let attempts9 = 0;
const flaky = () => {
  attempts9++;
  if (attempts9 < 3) throw new Error("fail");
  return "success";
};
const reliable = withRetry(flaky, { maxRetries: 5 });
assert(reliable() === "success", `withRetry returns "success"`);
assert(attempts9 === 3, `Took 3 attempts → got ${attempts9}`);

// =============================================================
// EXERCISE 10: Implement (Render Props - DataFetcher)
// =============================================================
section("Exercise 10: fetchAndRender");

type FetchState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

function fetchAndRender<T>(
  fetcher: () => T,
  render: (state: FetchState<T>) => string
): string {
  try {
    const data = fetcher();
    return render({ status: "success", data });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return render({ status: "error", error: message });
  }
}

const out10a = fetchAndRender(
  () => 42,
  (state) => {
    if (state.status === "success") return `Got: ${state.data}`;
    return state.status;
  }
);
assert(out10a === "Got: 42", `Success case → "${out10a}"`);

const out10b = fetchAndRender(
  (): number => { throw new Error("oops"); },
  (state) => {
    if (state.status === "error") return `Error: ${state.error}`;
    return state.status;
  }
);
assert(out10b === "Error: oops", `Error case → "${out10b}"`);

// =============================================================
// EXERCISE 11: Implement (Custom Hook - useLocalStorage)
// =============================================================
section("Exercise 11: useLocalStorage");

const storage = new Map<string, unknown>();

function useLocalStorage<T>(key: string, initialValue: T): {
  get: () => T;
  set: (value: T) => void;
  remove: () => void;
} {
  if (!storage.has(key)) {
    storage.set(key, initialValue);
  }
  return {
    get: () => (storage.has(key) ? storage.get(key) as T : initialValue),
    set: (value: T) => { storage.set(key, value); },
    remove: () => { storage.delete(key); },
  };
}

const name11 = useLocalStorage("name", "Alice");
assert(name11.get() === "Alice", `Initial value is "Alice"`);
name11.set("Bob");
assert(name11.get() === "Bob", `After set, value is "Bob"`);
const name11b = useLocalStorage("name", "Default");
assert(name11b.get() === "Bob", `Second hook same key gets "Bob"`);
name11.remove();
assert(name11.get() === "Alice", `After remove, back to initial "Alice"`);
storage.clear();

// =============================================================
// EXERCISE 12: Implement (Compound Components - Form)
// =============================================================
section("Exercise 12: createForm");

interface FormField {
  getValue: () => string;
  setValue: (v: string) => void;
  validate: () => boolean;
  getError: () => string | null;
}

interface FormBuilder {
  textField: (name: string, opts: { required?: boolean; minLength?: number }) => FormField;
  isValid: () => boolean;
  getErrors: () => Record<string, string>;
  getValues: () => Record<string, string>;
}

function createForm(): FormBuilder {
  const fields = new Map<string, { field: FormField; opts: { required?: boolean; minLength?: number }; value: string; error: string | null }>();

  const builder: FormBuilder = {
    textField(name, opts) {
      const entry = { value: "", error: null as string | null, opts, field: null as unknown as FormField };
      const field: FormField = {
        getValue: () => entry.value,
        setValue: (v: string) => { entry.value = v; entry.error = null; },
        validate: () => {
          if (opts.required && entry.value === "") {
            entry.error = "required";
            return false;
          }
          if (opts.minLength !== undefined && entry.value.length < opts.minLength) {
            entry.error = "minLength";
            return false;
          }
          entry.error = null;
          return true;
        },
        getError: () => entry.error,
      };
      entry.field = field;
      fields.set(name, entry);
      return field;
    },
    isValid: () => {
      let valid = true;
      for (const [, entry] of fields) {
        if (!entry.field.validate()) valid = false;
      }
      return valid;
    },
    getErrors: () => {
      const errors: Record<string, string> = {};
      for (const [name, entry] of fields) {
        entry.field.validate();
        if (entry.error) errors[name] = entry.error;
      }
      return errors;
    },
    getValues: () => {
      const values: Record<string, string> = {};
      for (const [name, entry] of fields) {
        values[name] = entry.value;
      }
      return values;
    },
  };

  return builder;
}

const form = createForm();
const username = form.textField("username", { required: true, minLength: 3 });
const email = form.textField("email", { required: true });
username.setValue("ab");
email.setValue("");
assert(form.isValid() === false, `Form is invalid with short username and empty email`);
const errors12 = form.getErrors();
assert(errors12.username === "minLength", `username error is "minLength"`);
assert(errors12.email === "required", `email error is "required"`);
username.setValue("alice");
email.setValue("a@b.com");
assert(form.isValid() === true, `Form is valid after corrections`);
const vals12 = form.getValues();
assert(vals12.username === "alice" && vals12.email === "a@b.com", `Values correct`);

// =============================================================
// EXERCISE 13: Implement (Context - multi-context)
// =============================================================
section("Exercise 13: createContextSystem");

interface ContextSystem {
  createContext: <T>(name: string, defaultValue: T) => {
    Provider: (value: T, fn: () => void) => void;
    useContext: () => T;
  };
}

function createContextSystem(): ContextSystem {
  const store = new Map<string, unknown>();

  return {
    createContext<T>(name: string, defaultValue: T) {
      if (!store.has(name)) store.set(name, defaultValue);
      return {
        Provider: (value: T, fn: () => void) => {
          const prev = store.get(name) as T;
          store.set(name, value);
          fn();
          store.set(name, prev);
        },
        useContext: () => store.get(name) as T,
      };
    },
  };
}

const system = createContextSystem();
const ThemeCtx2 = system.createContext("theme", "light");
const AuthCtx = system.createContext("auth", { user: "anonymous" });
const ctxResults: string[] = [];

ThemeCtx2.Provider("dark", () => {
  AuthCtx.Provider({ user: "alice" }, () => {
    ctxResults.push(ThemeCtx2.useContext());
    ctxResults.push(AuthCtx.useContext().user);
  });
  ctxResults.push(AuthCtx.useContext().user);
});
ctxResults.push(ThemeCtx2.useContext());

assert(ctxResults[0] === "dark", `Nested: theme is "dark"`);
assert(ctxResults[1] === "alice", `Nested: auth user is "alice"`);
assert(ctxResults[2] === "anonymous", `After auth provider: user is "anonymous"`);
assert(ctxResults[3] === "light", `After theme provider: theme is "light"`);

// =============================================================
// EXERCISE 14: Implement (Props Getter)
// =============================================================
section("Exercise 14: useToggle2 with props getter");

interface TogglePropsInput {
  onClick?: () => void;
  [key: string]: unknown;
}

interface ToggleProps {
  ariaPressed: boolean;
  onClick: () => void;
  [key: string]: unknown;
}

function useToggle2() {
  const state = createState(false);

  function toggle() {
    state.set(!state.get());
  }

  function reset() {
    state.set(false);
  }

  function getTogglerProps(userProps: TogglePropsInput = {}): ToggleProps {
    const { onClick: userOnClick, ...rest } = userProps;
    return {
      ariaPressed: state.get(),
      onClick: () => {
        toggle();
        userOnClick?.();
      },
      ...rest,
    };
  }

  function getResetProps(userProps: TogglePropsInput = {}): ToggleProps {
    const { onClick: userOnClick, ...rest } = userProps;
    return {
      ariaPressed: state.get(),
      onClick: () => {
        reset();
        userOnClick?.();
      },
      ...rest,
    };
  }

  return { isOn: () => state.get(), toggle, getTogglerProps, getResetProps };
}

const toggle14 = useToggle2();
const logs14: string[] = [];
const tProps = toggle14.getTogglerProps({ onClick: () => logs14.push("user-click") });
tProps.onClick();
assert(toggle14.isOn() === true, `After toggle: isOn is true`);
assert(logs14[0] === "user-click", `User onClick was called`);
const rProps = toggle14.getResetProps({ onClick: () => logs14.push("user-reset") });
rProps.onClick();
assert(toggle14.isOn() === false, `After reset: isOn is false`);
assert(logs14.length === 2 && logs14[1] === "user-reset", `Both user callbacks called`);

// =============================================================
// EXERCISE 15: Implement (Controlled vs Uncontrolled)
// =============================================================
section("Exercise 15: createInput (controlled/uncontrolled)");

interface InputConfig {
  value?: string;
  defaultValue?: string;
  onChange?: (newValue: string) => void;
}

interface InputHandle {
  type: (text: string) => void;
  getValue: () => string;
  isControlled: () => boolean;
}

function createInput(config: InputConfig): InputHandle {
  const controlled = config.value !== undefined;

  if (controlled) {
    return {
      type: (text: string) => {
        config.onChange?.(text);
      },
      getValue: () => config.value!,
      isControlled: () => true,
    };
  } else {
    let internal = config.defaultValue ?? "";
    return {
      type: (text: string) => {
        internal = text;
        config.onChange?.(text);
      },
      getValue: () => internal,
      isControlled: () => false,
    };
  }
}

// Controlled test
let external15 = "hello";
const controlled15 = createInput({
  value: external15,
  onChange: (v) => { external15 = v; },
});
assert(controlled15.isControlled() === true, `Controlled: isControlled() is true`);
assert(controlled15.getValue() === "hello", `Controlled: initial value is "hello"`);
controlled15.type("world");
assert(external15 === "world", `Controlled: onChange updated external to "world"`);
// getValue still returns "hello" because config.value is captured
assert(controlled15.getValue() === "hello", `Controlled: getValue() still reflects initial config.value`);

// Uncontrolled test
const uncontrolled15 = createInput({ defaultValue: "start" });
assert(uncontrolled15.isControlled() === false, `Uncontrolled: isControlled() is false`);
assert(uncontrolled15.getValue() === "start", `Uncontrolled: initial value is "start"`);
uncontrolled15.type("changed");
assert(uncontrolled15.getValue() === "changed", `Uncontrolled: getValue() reflects typed value`);

// =============================================================
// Summary
// =============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) process.exit(1);
