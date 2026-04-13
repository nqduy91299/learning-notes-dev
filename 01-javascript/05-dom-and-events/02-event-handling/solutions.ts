// ============================================================================
// 02-event-handling: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Shared Types ────────────────────────────────────────────────────────────

type Listener = (...args: unknown[]) => void;

interface SimulatedEvent {
  type: string;
  target: SimNode | null;
  currentTarget: SimNode | null;
  eventPhase: number;
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
  handlers: Map<string, Array<{ handler: (evt: SimulatedEvent) => void; capture: boolean }>>;
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: addEventListener allows multiple handlers; onclick does not

function solution1() {
  // In a browser, onclick is a DOM property — assigning it overwrites
  // the previous value. addEventListener registers independently.
  //
  // btn.onclick = () => console.log("A");
  // btn.onclick = () => console.log("B");   // overwrites "A"
  // btn.addEventListener("click", () => console.log("C"));
  // btn.addEventListener("click", () => console.log("D"));
  //
  // On click, the onclick handler fires first, then addEventListener handlers.

  console.log("B");
  console.log("C");
  console.log("D");
}

// ANSWER:
// B
// C
// D
//
// Explanation:
// The second `onclick =` assignment overwrites the first, so "A" never fires.
// addEventListener handlers ("C" and "D") are independent and both fire.
// onclick fires before addEventListener handlers in most browsers.
// See README → Section 2: Adding Event Handlers

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Event flow — capturing, target, bubbling phases

function solution2() {
  // Event flow for a click on #btn:
  // Phase 1 (Capturing): outer-capture, inner-capture
  // Phase 2 (Target): btn-1, btn-2 (registration order, capture flag ignored at target)
  // Phase 3 (Bubbling): inner-bubble, outer-bubble

  console.log("outer-capture");
  console.log("inner-capture");
  console.log("btn-1");
  console.log("btn-2");
  console.log("inner-bubble");
  console.log("outer-bubble");
}

// ANSWER:
// outer-capture
// inner-capture
// btn-1
// btn-2
// inner-bubble
// outer-bubble
//
// Explanation:
// During capturing (phase 1), handlers with capture=true fire top-down:
// outer-capture, then inner-capture. At the target (phase 2), ALL handlers
// fire in registration order regardless of capture flag: btn-1 then btn-2.
// During bubbling (phase 3), handlers with capture=false fire bottom-up:
// inner-bubble, then outer-bubble.
// See README → Section 5: Event Phases

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: stopPropagation — blocks further elements, not same-element handlers

function solution3() {
  console.log("child-1");
  console.log("child-2");
}

// ANSWER:
// child-1
// child-2
//
// Explanation:
// stopPropagation() prevents the event from reaching other elements (parent),
// but does NOT prevent other handlers on the SAME element from firing.
// Both child-1 and child-2 fire, but parent never fires.
// See README → Section 6: stopPropagation() vs stopImmediatePropagation()

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: stopImmediatePropagation — blocks ALL further handlers

function solution4() {
  console.log("child-1");
}

// ANSWER:
// child-1
//
// Explanation:
// stopImmediatePropagation() prevents ALL further handlers — even those on
// the same element. So child-2 and parent never fire.
// See README → Section 6: stopPropagation() vs stopImmediatePropagation()

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: event.target vs event.currentTarget

function solution5() {
  console.log("target: item");
  console.log("currentTarget: list");
  console.log("this: list");
}

// ANSWER:
// target: item
// currentTarget: list
// this: list
//
// Explanation:
// event.target is the element that originated the event (<li id="item">).
// event.currentTarget is the element the handler is attached to (<ul id="list">).
// In a non-arrow function handler, `this` equals currentTarget.
// See README → Section 4: The Event Object

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: removeEventListener requires same function reference

function solution6() {
  const handler1 = () => {};
  const handler2 = () => {};
  console.log(handler1 === handler2);
}

// ANSWER:
// handler1 === handler2: false
// Removal succeeds: No
//
// Explanation:
// Each arrow function expression creates a new function object. Even though
// handler1 and handler2 have identical code, they are different references.
// removeEventListener requires the EXACT same reference, so removal fails
// silently — the handler continues to fire.
// See README → Section 3: removeEventListener

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: preventDefault does NOT stop propagation

function solution7() {
  console.log("link handler");
  console.log("wrapper handler");
}

// ANSWER:
// link handler
// wrapper handler
// Navigation does NOT occur (prevented)
//
// Explanation:
// preventDefault() cancels the default action (navigation), but does NOT
// stop the event from propagating. The event still bubbles up to the
// wrapper, so both handlers fire. The key insight: preventDefault and
// stopPropagation are independent operations.
// See README → Section 7: event.preventDefault()

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
// Topic: Basic EventEmitter class

class EventEmitter {
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
    if (idx !== -1) {
      arr.splice(idx, 1);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    for (const fn of arr) {
      fn(...args);
    }
  }
}

// Explanation:
// The EventEmitter mirrors the core browser addEventListener pattern:
// - on() adds a listener to the array for that event name.
// - off() finds the listener by reference (indexOf) and removes it.
// - emit() iterates all listeners for the event and calls them with args.
// See README → Section 2.3: addEventListener (Recommended)

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: once() — listener that auto-removes after first call

class EventEmitterWithOnce extends EventEmitter {
  once(event: string, listener: Listener): void {
    const wrapper: Listener = (...args: unknown[]) => {
      this.off(event, wrapper);
      listener(...args);
    };
    this.on(event, wrapper);
  }
}

// Explanation:
// once() wraps the original listener in a function that first removes
// itself via off(), then calls the original listener. This mirrors
// the browser's { once: true } option for addEventListener.
// See README → Section 18: The once Option

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: Removing a once-wrapped listener by original reference

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

    // FIX: Check if the listener has a wrapped version in onceMap
    const wrapped = this.onceMap.get(listener);
    const toRemove = wrapped ?? listener;
    const idx = arr.indexOf(toRemove);
    if (idx !== -1) {
      arr.splice(idx, 1);
    }
    // Clean up the mapping
    if (wrapped) {
      this.onceMap.delete(listener);
    }
  }

  once(event: string, listener: Listener): void {
    const wrapped: Listener = (...args: unknown[]) => {
      this.off(event, wrapped);
      this.onceMap.delete(listener);
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

// Explanation:
// The bug was that off() only searched for the exact reference passed, but
// once() wraps the original listener. The fix: off() checks the onceMap
// to see if the passed listener has a wrapped version, and removes that
// wrapped version instead. This pattern is common in event libraries like
// Node.js EventEmitter where removeListener can find once-wrapped handlers.
// See README → Section 3: removeEventListener (same-reference requirement)

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Simulated DOM node tree

function createNode(name: string): SimNode {
  return {
    name,
    parent: null,
    children: [],
    handlers: new Map(),
  };
}

function addChild(parent: SimNode, child: SimNode): void {
  child.parent = parent;
  parent.children.push(child);
}

// Explanation:
// A SimNode models a DOM element with a parent reference and children array,
// forming a tree structure. The handlers map stores event listeners keyed
// by event type, each with a capture flag — mirroring how the browser stores
// capturing vs bubbling handlers separately.
// See README → Section 5: Event Phases (DOM tree structure)

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Register handlers on SimNode (with capture flag)

function addHandler(
  node: SimNode,
  eventType: string,
  handler: (evt: SimulatedEvent) => void,
  capture: boolean = false
): void {
  if (!node.handlers.has(eventType)) {
    node.handlers.set(eventType, []);
  }
  node.handlers.get(eventType)!.push({ handler, capture });
}

// Explanation:
// This mirrors addEventListener's third argument. Each handler entry stores
// both the function and a boolean indicating whether it's a capturing handler.
// The capture flag determines WHEN the handler fires during event dispatch.
// See README → Section 2.3: addEventListener options

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Create a SimulatedEvent object

function createEvent(
  type: string,
  target: SimNode | null,
  options?: { bubbles?: boolean; cancelable?: boolean; detail?: unknown }
): SimulatedEvent {
  const bubbles = options?.bubbles ?? false;
  const cancelable = options?.cancelable ?? false;
  const detail = options?.detail;

  return {
    type,
    target,
    currentTarget: null,
    eventPhase: 0,
    bubbles,
    cancelable,
    defaultPrevented: false,
    propagationStopped: false,
    immediatePropagationStopped: false,
    detail,
    preventDefault() {
      if (this.cancelable) {
        this.defaultPrevented = true;
      }
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

// Explanation:
// The SimulatedEvent mirrors the browser's Event/CustomEvent objects.
// - type, target, bubbles, cancelable, detail map to their browser equivalents
// - preventDefault only works when cancelable is true (matches browser behavior)
// - stopImmediatePropagation also sets propagationStopped (it's a superset)
// See README → Section 4: The Event Object & Section 14: Custom Events

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Event dispatching with capturing and bubbling phases

function dispatchSimEvent(target: SimNode, event: SimulatedEvent): void {
  // 1. Build path from root to target
  const path: SimNode[] = [];
  let current: SimNode | null = target;
  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  // Helper: fire handlers on a node for the given phase
  function fireHandlers(node: SimNode, phase: number): void {
    if (event.propagationStopped) return;

    event.currentTarget = node;
    event.eventPhase = phase;

    const handlers = node.handlers.get(event.type);
    if (!handlers) return;

    for (const entry of [...handlers]) {
      if (event.immediatePropagationStopped) return;

      // At target phase (2): fire all handlers regardless of capture flag
      // At capturing phase (1): fire only capture handlers
      // At bubbling phase (3): fire only non-capture handlers
      if (phase === 2 || (phase === 1 && entry.capture) || (phase === 3 && !entry.capture)) {
        entry.handler(event);
      }
    }
  }

  // 2. Capturing phase: root → ... → parent of target
  for (let i = 0; i < path.length - 1; i++) {
    fireHandlers(path[i], 1);
    if (event.propagationStopped) return;
  }

  // 3. Target phase
  fireHandlers(target, 2);
  if (event.propagationStopped) return;

  // 4. Bubbling phase: parent of target → ... → root
  if (event.bubbles) {
    for (let i = path.length - 2; i >= 0; i--) {
      fireHandlers(path[i], 3);
      if (event.propagationStopped) return;
    }
  }

  event.currentTarget = null;
}

// Explanation:
// This is the full DOM event flow simulation:
// 1. Build the propagation path (root → target)
// 2. Capturing: walk down, fire capture handlers on each ancestor
// 3. Target: fire ALL handlers on the target (capture flag ignored at target)
// 4. Bubbling: walk back up, fire non-capture handlers on each ancestor
//
// stopPropagation prevents moving to the NEXT node.
// stopImmediatePropagation prevents firing ANY more handlers.
//
// The [...handlers] spread creates a snapshot to safely iterate even if
// handlers modify the array (e.g., a once-handler removing itself).
// See README → Section 5: Event Phases

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: stopPropagation in simulated event system

function testStopPropagation(): string[] {
  const logs: string[] = [];

  const root = createNode("root");
  const mid = createNode("mid");
  const leaf = createNode("leaf");
  addChild(root, mid);
  addChild(mid, leaf);

  // Capturing handler on root
  addHandler(root, "click", () => logs.push("root-capture"), true);

  // Two capturing handlers on mid — first calls stopPropagation
  addHandler(mid, "click", (evt) => {
    logs.push("mid-capture-1");
    evt.stopPropagation();
  }, true);
  addHandler(mid, "click", () => logs.push("mid-capture-2"), true);

  // Handler on leaf (should NOT fire)
  addHandler(leaf, "click", () => logs.push("leaf"), false);

  // Bubbling handlers (should NOT fire)
  addHandler(mid, "click", () => logs.push("mid-bubble"), false);
  addHandler(root, "click", () => logs.push("root-bubble"), false);

  const evt = createEvent("click", leaf, { bubbles: true });
  dispatchSimEvent(leaf, evt);

  return logs;
}

// Explanation:
// The capturing phase starts at root (fires root-capture), then moves to mid.
// At mid, mid-capture-1 fires and calls stopPropagation(). This prevents
// the event from reaching any further NODES (leaf, and back up for bubbling).
// However, mid-capture-2 fires because stopPropagation only stops propagation
// to other nodes — handlers on the SAME node still execute.
// If stopImmediatePropagation had been used, mid-capture-2 would also be blocked.
// See README → Section 6: stopPropagation() vs stopImmediatePropagation()

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Event delegation pattern

type MatchFn = (node: SimNode) => boolean;
type DelegateCallback = (event: SimulatedEvent, matchedNode: SimNode) => void;

class DelegatedHandler {
  constructor(
    private parentNode: SimNode,
    private eventType: string,
    private matchFn: MatchFn,
    private callback: DelegateCallback
  ) {
    // Register a bubbling handler on the parent node
    addHandler(this.parentNode, this.eventType, (evt: SimulatedEvent) => {
      // Walk from target up to (but not including) parentNode to find a match
      let node: SimNode | null = evt.target;
      while (node && node !== this.parentNode) {
        if (this.matchFn(node)) {
          this.callback(evt, node);
          return;
        }
        node = node.parent;
      }
    }, false);
  }
}

// Explanation:
// Event delegation attaches ONE handler on a parent element. When an event
// bubbles up to the parent, the handler inspects event.target and walks up
// the tree (like closest() in the browser) to find the first matching node.
// This avoids attaching handlers to every child element.
//
// Benefits: memory efficient, handles dynamically added children, simple cleanup.
// The walk-up pattern mirrors element.closest(selector) in the browser DOM.
// See README → Section 8-9: Event Delegation

// ─── Exercise 17: Fix the Bug ───────────────────────────────────────────────
// Topic: Handler modifying listener array during iteration

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
    // FIX: iterate a snapshot (copy) of the array so that mutations
    // (like off() removing a handler) during iteration don't cause skips.
    const snapshot = [...arr];
    for (let i = 0; i < snapshot.length; i++) {
      snapshot[i](...args);
    }
  }
}

// Explanation:
// The bug: when iterating `arr` directly and a handler calls off() to remove
// itself, splice() shifts all subsequent elements left by one. The loop index
// advances, effectively skipping the next handler. The fix: spread into a
// snapshot array so the iteration indices are stable regardless of mutations
// to the original array. This is the same reason dispatchSimEvent uses
// [...handlers] when iterating handler arrays.
// See README → Section 6 (stopping propagation safely requires snapshots)

// ─── Exercise 18: Fix the Bug ───────────────────────────────────────────────
// Topic: preventDefault only works when cancelable is true

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
    // FIX: Only set defaultPrevented when cancelable is true
    preventDefault() {
      if (this.cancelable) {
        this.defaultPrevented = true;
      }
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

// Explanation:
// In the browser, calling preventDefault() on a non-cancelable event
// (like scroll on certain targets) is a no-op. The fix adds a guard
// that checks `this.cancelable` before setting defaultPrevented.
// This matches the browser spec behavior.
// See README → Section 7: event.preventDefault()

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: onclick vs addEventListener ===");
solution1();

console.log("\n=== Exercise 2: Event flow phases ===");
solution2();

console.log("\n=== Exercise 3: stopPropagation ===");
solution3();

console.log("\n=== Exercise 4: stopImmediatePropagation ===");
solution4();

console.log("\n=== Exercise 5: target vs currentTarget ===");
solution5();

console.log("\n=== Exercise 6: Function reference equality ===");
solution6();

console.log("\n=== Exercise 7: preventDefault vs stopPropagation ===");
solution7();

console.log("\n=== Exercise 8: EventEmitter ===");
const emitter8 = new EventEmitter();
const h8a = (...args: unknown[]) => console.log("h1:", ...args);
const h8b = (...args: unknown[]) => console.log("h2:", ...args);
emitter8.on("data", h8a);
emitter8.on("data", h8b);
emitter8.emit("data", 1, 2);
emitter8.off("data", h8a);
emitter8.emit("data", 3);
emitter8.emit("nope");

console.log("\n=== Exercise 9: once() ===");
const emo9 = new EventEmitterWithOnce();
emo9.once("connect", () => console.log("connected!"));
emo9.emit("connect");
emo9.emit("connect");
console.log("(second emit produced no output — correct)");

console.log("\n=== Exercise 10: Fix once + off ===");
const emf10 = new EventEmitterOnceFixable();
const myHandler10 = () => console.log("should NOT fire");
emf10.once("test", myHandler10);
emf10.off("test", myHandler10);
emf10.emit("test");
console.log("done (no output above means fix works)");

console.log("\n=== Exercise 11: SimNode tree ===");
const root11 = createNode("root");
const child11 = createNode("child");
const grandchild11 = createNode("grandchild");
addChild(root11, child11);
addChild(child11, grandchild11);
console.log(grandchild11.parent?.name);
console.log(grandchild11.parent?.parent?.name);
console.log(root11.children[0].name);
console.log(root11.children[0].children[0].name);

console.log("\n=== Exercise 12: addHandler ===");
const n12 = createNode("test");
addHandler(n12, "click", () => {}, false);
addHandler(n12, "click", () => {}, true);
console.log(n12.handlers.get("click")?.length);

console.log("\n=== Exercise 13: createEvent ===");
const evt13 = createEvent("click", null, { bubbles: true, cancelable: true, detail: { x: 10 } });
console.log(evt13.type);
console.log(evt13.bubbles);
console.log(evt13.cancelable);
console.log(evt13.detail);
evt13.preventDefault();
console.log(evt13.defaultPrevented);
evt13.stopPropagation();
console.log(evt13.propagationStopped);

console.log("\n=== Exercise 14: dispatchSimEvent ===");
const r14 = createNode("root");
const p14 = createNode("parent");
const t14 = createNode("target");
addChild(r14, p14);
addChild(p14, t14);

const logs14: string[] = [];
addHandler(r14, "click", () => logs14.push("root-capture"), true);
addHandler(p14, "click", () => logs14.push("parent-capture"), true);
addHandler(t14, "click", () => logs14.push("target-1"), false);
addHandler(t14, "click", () => logs14.push("target-2"), true);
addHandler(p14, "click", () => logs14.push("parent-bubble"), false);
addHandler(r14, "click", () => logs14.push("root-bubble"), false);

const ev14 = createEvent("click", t14, { bubbles: true });
dispatchSimEvent(t14, ev14);
console.log(logs14);

console.log("\n=== Exercise 15: stopPropagation test ===");
console.log(testStopPropagation());

console.log("\n=== Exercise 16: Event delegation ===");
const container16 = createNode("container");
const btnA16 = createNode("btn-save");
const btnB16 = createNode("btn-delete");
const span16 = createNode("icon");
addChild(container16, btnA16);
addChild(container16, btnB16);
addChild(btnA16, span16);

const delegateLogs16: string[] = [];
new DelegatedHandler(
  container16,
  "click",
  (node) => node.name.startsWith("btn-"),
  (_evt, matched) => delegateLogs16.push(`clicked: ${matched.name}`)
);

// Click on btnB — direct match
const ev16a = createEvent("click", btnB16, { bubbles: true });
dispatchSimEvent(btnB16, ev16a);

// Click on span (child of btnA) — delegation walks up to find btn-save
const ev16b = createEvent("click", span16, { bubbles: true });
dispatchSimEvent(span16, ev16b);

console.log(delegateLogs16);

console.log("\n=== Exercise 17: Fix buggy emitter ===");
const buggy17 = new BuggyEmitter();
const results17: string[] = [];
const selfRemover17 = () => {
  results17.push("A");
  buggy17.off("evt", selfRemover17);
};
buggy17.on("evt", selfRemover17);
buggy17.on("evt", () => results17.push("B"));
buggy17.emit("evt");
console.log(results17);

console.log("\n=== Exercise 18: Fix cancelable preventDefault ===");
const cancelableEvt18 = createEventBuggy("submit", { cancelable: true });
cancelableEvt18.preventDefault();
console.log(cancelableEvt18.defaultPrevented);

const nonCancelableEvt18 = createEventBuggy("scroll", { cancelable: false });
nonCancelableEvt18.preventDefault();
console.log(nonCancelableEvt18.defaultPrevented);
