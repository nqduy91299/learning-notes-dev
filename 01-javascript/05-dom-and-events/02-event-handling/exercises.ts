// ============================================================================
// 02-event-handling: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/05-dom-and-events/02-event-handling/exercises.ts
//
// NOTE: These exercises run in Node.js, not a browser.
// Event concepts are tested via a simulated event system.
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Shared Types ────────────────────────────────────────────────────────────
// These types are used across multiple exercises. Do NOT modify them.

type Listener = (...args: unknown[]) => void;

interface SimulatedEvent {
  type: string;
  target: SimNode | null;
  currentTarget: SimNode | null;
  eventPhase: number; // 1=capturing, 2=target, 3=bubbling
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  propagationStopped: boolean;
  immediatePropagationStopped: boolean;
  detail?: unknown;
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}

interface SimNode {
  name: string;
  parent: SimNode | null;
  children: SimNode[];
  /** Map of event type → array of { handler, capture } */
  handlers: Map<string, Array<{ handler: (evt: SimulatedEvent) => void; capture: boolean }>>;
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: addEventListener allows multiple handlers; onclick does not
//
// In a browser, given this HTML: <button id="btn">Click</button>
// What would each console.log print when the button is clicked?
//
// const btn = document.getElementById("btn");
//
// btn.onclick = () => console.log("A");
// btn.onclick = () => console.log("B");   // overwrites "A"
//
// btn.addEventListener("click", () => console.log("C"));
// btn.addEventListener("click", () => console.log("D"));
//
// // User clicks the button. What logs, and in what order?

// YOUR ANSWER:
// ???

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Event flow — capturing, target, bubbling phases
//
// In a browser with this structure:
//   <div id="outer">
//     <div id="inner">
//       <button id="btn">Click</button>
//     </div>
//   </div>
//
// const outer = document.getElementById("outer");
// const inner = document.getElementById("inner");
// const btn   = document.getElementById("btn");
//
// outer.addEventListener("click", () => console.log("outer-capture"), true);
// inner.addEventListener("click", () => console.log("inner-capture"), true);
// btn.addEventListener("click",   () => console.log("btn-1"));
// btn.addEventListener("click",   () => console.log("btn-2"), true);
// inner.addEventListener("click", () => console.log("inner-bubble"));
// outer.addEventListener("click", () => console.log("outer-bubble"));
//
// // User clicks the button. What is the exact output order?

// YOUR ANSWER:
// ???

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: stopPropagation — blocks further elements, not same-element handlers
//
// In a browser:
//   <div id="parent">
//     <button id="child">Click</button>
//   </div>
//
// const parent = document.getElementById("parent");
// const child  = document.getElementById("child");
//
// child.addEventListener("click", (e) => {
//   console.log("child-1");
//   e.stopPropagation();
// });
// child.addEventListener("click", () => console.log("child-2"));
// parent.addEventListener("click", () => console.log("parent"));
//
// // User clicks the child button. What logs?

// YOUR ANSWER:
// ???

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: stopImmediatePropagation — blocks ALL further handlers
//
// Same DOM as Exercise 3, but using stopImmediatePropagation:
//
// child.addEventListener("click", (e) => {
//   console.log("child-1");
//   e.stopImmediatePropagation();
// });
// child.addEventListener("click", () => console.log("child-2"));
// parent.addEventListener("click", () => console.log("parent"));
//
// // User clicks the child button. What logs?

// YOUR ANSWER:
// ???

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: event.target vs event.currentTarget
//
// In a browser:
//   <ul id="list">
//     <li id="item">Click me</li>
//   </ul>
//
// const list = document.getElementById("list");
// list.addEventListener("click", function (e) {
//   console.log("target:", e.target.id);
//   console.log("currentTarget:", e.currentTarget.id);
//   console.log("this:", this.id);
// });
//
// // User clicks on the <li id="item">. What logs?

// YOUR ANSWER:
// ???

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: removeEventListener requires same function reference
//
// function exercise6() {
//   const logs: string[] = [];
//
//   // Simulating browser behavior conceptually:
//   // btn.addEventListener("click", () => logs.push("A"));
//   // btn.removeEventListener("click", () => logs.push("A"));
//   // btn.click(); // Does removal work?
//
//   // Since anonymous arrow functions create new references:
//   const handler1 = () => logs.push("A");
//   const handler2 = () => logs.push("A"); // different reference!
//
//   console.log(handler1 === handler2);
//   // So if addEventListener used handler1 and removeEventListener used handler2,
//   // would the handler be removed?
// }
//
// What does handler1 === handler2 evaluate to?
// Would the removal succeed in a browser?

// YOUR ANSWER:
// handler1 === handler2: ???
// Removal succeeds: ???

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: preventDefault does NOT stop propagation
//
// In a browser:
//   <div id="wrapper">
//     <a id="link" href="https://example.com">Click</a>
//   </div>
//
// const wrapper = document.getElementById("wrapper");
// const link = document.getElementById("link");
//
// link.addEventListener("click", (e) => {
//   e.preventDefault();
//   console.log("link handler");
// });
// wrapper.addEventListener("click", () => {
//   console.log("wrapper handler");
// });
//
// // User clicks the link. What logs? Does navigation occur?

// YOUR ANSWER:
// ???

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
// Topic: Basic EventEmitter class
//
// Implement an EventEmitter with:
//   on(event, listener)    — register a listener
//   off(event, listener)   — remove a listener (by reference)
//   emit(event, ...args)   — call all listeners for that event with args
//
// Requirements:
// - Multiple listeners for the same event
// - off() only removes the exact reference passed
// - emit() on an event with no listeners does nothing (no error)
// - Listeners are called in the order they were registered

class EventEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): void {
    // YOUR CODE HERE
  }

  off(event: string, listener: Listener): void {
    // YOUR CODE HERE
  }

  emit(event: string, ...args: unknown[]): void {
    // YOUR CODE HERE
  }
}

// Uncomment to test:
// const emitter = new EventEmitter();
// const h1 = (...args: unknown[]) => console.log("h1:", ...args);
// const h2 = (...args: unknown[]) => console.log("h2:", ...args);
// emitter.on("data", h1);
// emitter.on("data", h2);
// emitter.emit("data", 1, 2);    // Expected: "h1: 1 2", "h2: 1 2"
// emitter.off("data", h1);
// emitter.emit("data", 3);       // Expected: "h2: 3"
// emitter.emit("nope");          // Expected: (nothing)

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: once() — listener that auto-removes after first call
//
// Extend EventEmitter with a `once` method. The listener should fire at most
// one time, then be automatically removed.

class EventEmitterWithOnce extends EventEmitter {
  once(event: string, listener: Listener): void {
    // YOUR CODE HERE
  }
}

// Uncomment to test:
// const emo = new EventEmitterWithOnce();
// emo.once("connect", () => console.log("connected!"));
// emo.emit("connect"); // Expected: "connected!"
// emo.emit("connect"); // Expected: (nothing — already removed)

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: Removing a once-wrapped listener by original reference
//
// Bug: The user registers a `once` listener, then tries to remove it before
// it fires using the original function reference. But off() can't find it
// because `once()` wrapped it. Fix the implementation so that off() can
// remove a once-listener by its original reference.
//
// Hint: Store a mapping from original listener to the wrapped version.

class EventEmitterOnceFixable {
  private listeners: Map<string, Listener[]> = new Map();
  private onceMap: Map<Listener, Listener> = new Map();

  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Listener): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    // BUG: This only looks for the exact reference, but once() wraps
    // the listener in a new function. Fix this so off() also checks
    // the onceMap for the wrapped version.
    const idx = arr.indexOf(listener);
    if (idx !== -1) {
      arr.splice(idx, 1);
    }
  }

  once(event: string, listener: Listener): void {
    const wrapped: Listener = (...args: unknown[]) => {
      this.off(event, wrapped);
      listener(...args);
    };
    this.onceMap.set(listener, wrapped);
    this.on(event, wrapped);
  }

  emit(event: string, ...args: unknown[]): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    [...arr].forEach((fn) => fn(...args));
  }
}

// Uncomment to test:
// const emf = new EventEmitterOnceFixable();
// const myHandler = () => console.log("should NOT fire");
// emf.once("test", myHandler);
// emf.off("test", myHandler);   // Should remove the once-listener
// emf.emit("test");             // Expected: (nothing)
// console.log("done");          // Expected: "done"

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Simulated DOM node tree
//
// Implement createNode() and addChild() to build a tree of SimNode objects.
// This tree will be used in later exercises for event propagation simulation.

function createNode(name: string): SimNode {
  // YOUR CODE HERE
  return {
    name: "",
    parent: null,
    children: [],
    handlers: new Map(),
  };
}

function addChild(parent: SimNode, child: SimNode): void {
  // YOUR CODE HERE — set parent/child relationship
}

// Uncomment to test:
// const root = createNode("root");
// const child = createNode("child");
// const grandchild = createNode("grandchild");
// addChild(root, child);
// addChild(child, grandchild);
// console.log(grandchild.parent?.name);             // Expected: "child"
// console.log(grandchild.parent?.parent?.name);      // Expected: "root"
// console.log(root.children[0].name);                // Expected: "child"
// console.log(root.children[0].children[0].name);    // Expected: "grandchild"

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Register handlers on SimNode (with capture flag)
//
// Implement addHandler() that registers an event handler on a SimNode,
// storing whether it's a capturing or bubbling handler.

function addHandler(
  node: SimNode,
  eventType: string,
  handler: (evt: SimulatedEvent) => void,
  capture: boolean = false
): void {
  // YOUR CODE HERE
}

// Uncomment to test:
// const n = createNode("test");
// addHandler(n, "click", () => {}, false);
// addHandler(n, "click", () => {}, true);
// console.log(n.handlers.get("click")?.length); // Expected: 2

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Create a SimulatedEvent object
//
// Implement createEvent() that returns a SimulatedEvent with proper defaults
// and working preventDefault/stopPropagation/stopImmediatePropagation methods.

function createEvent(
  type: string,
  target: SimNode | null,
  options?: { bubbles?: boolean; cancelable?: boolean; detail?: unknown }
): SimulatedEvent {
  // YOUR CODE HERE
  return {
    type: "",
    target: null,
    currentTarget: null,
    eventPhase: 0,
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    propagationStopped: false,
    immediatePropagationStopped: false,
    preventDefault() {},
    stopPropagation() {},
    stopImmediatePropagation() {},
  };
}

// Uncomment to test:
// const evt = createEvent("click", null, { bubbles: true, cancelable: true, detail: { x: 10 } });
// console.log(evt.type);             // Expected: "click"
// console.log(evt.bubbles);          // Expected: true
// console.log(evt.cancelable);       // Expected: true
// console.log(evt.detail);           // Expected: { x: 10 }
// evt.preventDefault();
// console.log(evt.defaultPrevented); // Expected: true
// evt.stopPropagation();
// console.log(evt.propagationStopped); // Expected: true

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Event dispatching with capturing and bubbling phases
//
// Implement dispatchEvent() that simulates the full DOM event flow:
//   Phase 1 (Capturing): Walk from root down to parent of target,
//            firing handlers registered with capture=true
//   Phase 2 (Target): Fire all handlers on the target node
//            (both capture and bubble handlers, in registration order)
//   Phase 3 (Bubbling): Walk from parent of target back up to root,
//            firing handlers registered with capture=false
//            (only if event.bubbles is true)
//
// Must respect stopPropagation and stopImmediatePropagation.

function dispatchSimEvent(target: SimNode, event: SimulatedEvent): void {
  // YOUR CODE HERE
  //
  // Steps:
  // 1. Build the path from root to target (collect ancestors)
  // 2. Capturing phase: iterate path from root to target's parent
  // 3. Target phase: fire handlers on target
  // 4. Bubbling phase: iterate path from target's parent back to root
}

// Uncomment to test:
// const r = createNode("root");
// const p = createNode("parent");
// const t = createNode("target");
// addChild(r, p);
// addChild(p, t);
//
// const logs: string[] = [];
// addHandler(r, "click", () => logs.push("root-capture"), true);
// addHandler(p, "click", () => logs.push("parent-capture"), true);
// addHandler(t, "click", () => logs.push("target-1"), false);
// addHandler(t, "click", () => logs.push("target-2"), true);
// addHandler(p, "click", () => logs.push("parent-bubble"), false);
// addHandler(r, "click", () => logs.push("root-bubble"), false);
//
// const ev = createEvent("click", t, { bubbles: true });
// dispatchSimEvent(t, ev);
// console.log(logs);
// Expected: ["root-capture", "parent-capture", "target-1", "target-2", "parent-bubble", "root-bubble"]

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: stopPropagation in simulated event system
//
// Using the functions from exercises 11-14, verify that stopPropagation
// prevents handlers on ancestor/descendant nodes from firing, but still
// allows remaining handlers on the SAME node.
//
// Implement a test function that:
// 1. Builds a 3-node tree (root → mid → leaf)
// 2. Adds a capturing handler on root
// 3. Adds two handlers on mid (capture): first calls stopPropagation
// 4. Adds a handler on leaf
// 5. Dispatches a bubbling click event on leaf
// 6. Returns the collected log array

function testStopPropagation(): string[] {
  const logs: string[] = [];
  // YOUR CODE HERE
  return logs;
}

// Uncomment to test:
// console.log(testStopPropagation());
// Expected: ["root-capture", "mid-capture-1", "mid-capture-2"]
// (root-capture fires, then mid-capture-1 stops propagation,
//  mid-capture-2 fires because it's on the same node,
//  but leaf and bubbling handlers don't fire)

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Event delegation pattern
//
// Implement a DelegatedHandler class that simulates event delegation.
// It takes a parent SimNode and a matching function, and only invokes
// the callback when the event target matches.

type MatchFn = (node: SimNode) => boolean;
type DelegateCallback = (event: SimulatedEvent, matchedNode: SimNode) => void;

class DelegatedHandler {
  constructor(
    private parentNode: SimNode,
    private eventType: string,
    private matchFn: MatchFn,
    private callback: DelegateCallback
  ) {
    // YOUR CODE HERE — register a bubbling handler on parentNode
    // that checks if event.target matches, and if so, calls callback
  }
}

// Uncomment to test:
// const container = createNode("container");
// const btnA = createNode("btn-save");
// const btnB = createNode("btn-delete");
// const span = createNode("icon");
// addChild(container, btnA);
// addChild(container, btnB);
// addChild(btnA, span);
//
// const delegateLogs: string[] = [];
// new DelegatedHandler(
//   container,
//   "click",
//   (node) => node.name.startsWith("btn-"),
//   (_evt, matched) => delegateLogs.push(`clicked: ${matched.name}`)
// );
//
// // Simulate click on btnB
// const ev1 = createEvent("click", btnB, { bubbles: true });
// dispatchSimEvent(btnB, ev1);
//
// // Simulate click on span (inside btnA) — delegation should find btnA
// // For this, we need closest-like behavior. The matchFn checks event.target
// // or walks up. For simplicity, check target and its ancestors.
//
// console.log(delegateLogs); // Expected: ["clicked: btn-delete"]

// ─── Exercise 17: Fix the Bug ───────────────────────────────────────────────
// Topic: Handler modifying listener array during iteration
//
// Bug: When a handler removes itself during emit, it can cause
// handlers to be skipped. Fix the emit method.

class BuggyEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Listener): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx !== -1) arr.splice(idx, 1);
  }

  emit(event: string, ...args: unknown[]): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    // BUG: iterating the original array while handlers may call off()
    // causes indices to shift and handlers to be skipped.
    // Fix: iterate over a snapshot (copy) of the array.
    for (let i = 0; i < arr.length; i++) {
      arr[i](...args);
    }
  }
}

// Uncomment to test:
// const buggy = new BuggyEmitter();
// const results: string[] = [];
// const selfRemover = () => {
//   results.push("A");
//   buggy.off("evt", selfRemover);
// };
// buggy.on("evt", selfRemover);
// buggy.on("evt", () => results.push("B"));
// buggy.emit("evt");
// console.log(results); // Expected: ["A", "B"] — but buggy version gives ["A"]

// ─── Exercise 18: Fix the Bug ───────────────────────────────────────────────
// Topic: preventDefault only works when cancelable is true
//
// Bug: The createEvent function below allows preventDefault even when
// cancelable is false. Fix it so that preventDefault is a no-op
// when cancelable is false.

function createEventBuggy(
  type: string,
  options?: { cancelable?: boolean }
): SimulatedEvent {
  const cancelable = options?.cancelable ?? false;
  return {
    type,
    target: null,
    currentTarget: null,
    eventPhase: 0,
    bubbles: false,
    cancelable,
    defaultPrevented: false,
    propagationStopped: false,
    immediatePropagationStopped: false,
    // BUG: This always sets defaultPrevented to true, even when
    // cancelable is false. Fix it.
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    },
    stopImmediatePropagation() {
      this.immediatePropagationStopped = true;
      this.propagationStopped = true;
    },
  };
}

// Uncomment to test:
// const cancelableEvt = createEventBuggy("submit", { cancelable: true });
// cancelableEvt.preventDefault();
// console.log(cancelableEvt.defaultPrevented); // Expected: true
//
// const nonCancelableEvt = createEventBuggy("scroll", { cancelable: false });
// nonCancelableEvt.preventDefault();
// console.log(nonCancelableEvt.defaultPrevented); // Expected: false (bug: currently true)
